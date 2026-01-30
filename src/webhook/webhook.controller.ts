import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FonnteWebhookPayload {
    sender: string;
    message: string;
    device: string;
    name?: string;
}

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private prisma: PrismaService) { }

    @Post('fonnte')
    async handleFonnteWebhook(@Body() payload: FonnteWebhookPayload) {
        this.logger.log(`Received webhook from ${payload.sender}: ${payload.message}`);

        const message = payload.message.trim().toUpperCase();
        const senderPhone = payload.sender.startsWith('+')
            ? payload.sender
            : `+${payload.sender}`;

        // Find the user by phone
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { phoneE164: senderPhone },
                    { phoneE164: payload.sender },
                    { phoneE164: senderPhone.replace('+62', '0') },
                ],
            },
        });

        if (!user) {
            this.logger.warn(`Unknown sender: ${payload.sender}`);
            return { status: 'ignored', reason: 'unknown sender' };
        }

        // Find the latest pending message log for this user
        const latestLog = await this.prisma.messageLog.findFirst({
            where: {
                userId: user.id,
                status: 'sent',
                completedAt: null,
            },
            orderBy: { sentAt: 'desc' },
        });

        if (!latestLog) {
            this.logger.log(`No pending message for user ${user.name}`);
            return { status: 'ok', message: 'no pending message' };
        }

        // Handle replies
        if (message === 'SELESAI') {
            await this.prisma.messageLog.update({
                where: { id: latestLog.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                },
            });
            this.logger.log(`Marked as completed: ${latestLog.id}`);
            return { status: 'ok', action: 'completed' };
        }

        if (message === 'TUNDA' || message.startsWith('TUNDA ')) {
            const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await this.prisma.messageLog.update({
                where: { id: latestLog.id },
                data: {
                    status: 'snoozed',
                    snoozeUntil,
                },
            });
            this.logger.log(`Snoozed until ${snoozeUntil.toISOString()}: ${latestLog.id}`);
            return { status: 'ok', action: 'snoozed', until: snoozeUntil };
        }

        if (message.startsWith('CATAT:') || message.startsWith('CATAT ')) {
            const note = payload.message.substring(message.indexOf(':') + 1).trim() ||
                payload.message.substring(5).trim();
            await this.prisma.messageLog.update({
                where: { id: latestLog.id },
                data: {
                    note,
                    status: 'completed',
                    completedAt: new Date(),
                },
            });
            this.logger.log(`Note added: ${note}`);
            return { status: 'ok', action: 'noted', note };
        }

        return { status: 'ok', message: 'unrecognized command' };
    }
}
