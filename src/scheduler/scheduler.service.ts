import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as cron from 'node-cron';
import { PrismaService } from '../prisma/prisma.service';
import { FonnteService } from '../fonnte/fonnte.service';
import { AiService } from '../ai/ai.service';


@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(SchedulerService.name);
    private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();

    constructor(
        private prisma: PrismaService,
        private fonnte: FonnteService,
        private ai: AiService,
    ) { }


    async onModuleInit() {
        this.logger.log('Initializing scheduler...');
        await this.loadAndScheduleAll();
    }

    onModuleDestroy() {
        this.logger.log('Stopping all scheduled tasks...');
        this.scheduledTasks.forEach((task, id) => {
            task.stop();
            this.logger.log(`Stopped task: ${id}`);
        });
    }

    async loadAndScheduleAll() {
        const schedules = await this.prisma.schedule.findMany({
            where: { enabled: true },
            include: {
                user: true,
                pet: true,
                template: true,
            },
        });

        this.logger.log(`Found ${schedules.length} active schedules`);

        for (const schedule of schedules) {
            this.scheduleJob(schedule);
        }
    }

    scheduleJob(schedule: {
        id: string;
        cron: string;
        user: { id: string; phoneE164: string; name: string };
        pet: { id: string; name: string };
        template: { id: string; title: string; body: string };
    }) {
        // Stop existing task if any
        if (this.scheduledTasks.has(schedule.id)) {
            this.scheduledTasks.get(schedule.id)?.stop();
        }

        if (!cron.validate(schedule.cron)) {
            this.logger.error(`Invalid cron expression for schedule ${schedule.id}: ${schedule.cron}`);
            return;
        }

        const task = cron.schedule(
            schedule.cron,
            async () => {
                await this.executeSchedule(schedule);
            },
            {
                timezone: 'Asia/Jakarta',
            },
        );

        this.scheduledTasks.set(schedule.id, task);
        this.logger.log(
            `Scheduled: ${schedule.template.title} (${schedule.cron}) for ${schedule.pet.name}`,
        );
    }

    async executeSchedule(schedule: {
        id: string;
        user: { id: string; phoneE164: string; name: string };
        pet: { id: string; name: string };
        template: { id: string; title: string; body: string };
    }) {
        this.logger.log(`Executing schedule: ${schedule.template.title} for ${schedule.pet.name}`);

        const personalizedContent = await this.ai.generateNotification(schedule.template.title);
        const message = `*${schedule.template.title}*\n\n${personalizedContent}`;


        const result = await this.fonnte.sendMessage(schedule.user.phoneE164, message);

        // Log the message
        await this.prisma.messageLog.create({
            data: {
                scheduleId: schedule.id,
                userId: schedule.user.id,
                petId: schedule.pet.id,
                templateId: schedule.template.id,
                status: result.success ? 'sent' : 'failed',
                fonnteMsgId: result.messageId,
                note: result.error,
            },
        });

        if (result.success) {
            this.logger.log(`Message sent successfully to ${schedule.user.phoneE164}`);
        } else {
            this.logger.error(`Failed to send message: ${result.error}`);
        }
    }

    async sendEmergency(petId: string) {
        const pet = await this.prisma.pet.findUnique({
            where: { id: petId },
            include: { user: true },
        });

        if (!pet) {
            throw new Error('Pet not found');
        }

        const template = await this.prisma.messageTemplate.findUnique({
            where: { key: 'emergency' },
        });

        if (!template) {
            throw new Error('Emergency template not found');
        }

        const message = `*${template.title}*\n\n${template.body}`;
        const result = await this.fonnte.sendMessage(pet.user.phoneE164, message);

        await this.prisma.messageLog.create({
            data: {
                userId: pet.user.id,
                petId: pet.id,
                templateId: template.id,
                status: result.success ? 'sent' : 'failed',
                fonnteMsgId: result.messageId,
                note: result.error,
            },
        });

        return result;
    }

    async refreshSchedule(scheduleId: string) {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: { user: true, pet: true, template: true },
        });

        if (!schedule) {
            // Remove if exists
            if (this.scheduledTasks.has(scheduleId)) {
                this.scheduledTasks.get(scheduleId)?.stop();
                this.scheduledTasks.delete(scheduleId);
            }
            return;
        }

        if (schedule.enabled) {
            this.scheduleJob(schedule);
        } else {
            this.scheduledTasks.get(scheduleId)?.stop();
            this.scheduledTasks.delete(scheduleId);
        }
    }
}
