import { Controller, Get, Post, Put, Delete, Param, Body, Query, Logger, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { FonnteService } from '../fonnte/fonnte.service';
import { AiService } from '../ai/ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('api')
@UseGuards(JwtAuthGuard)
export class ApiController {
    private readonly logger = new Logger(ApiController.name);

    constructor(
        private prisma: PrismaService,
        private scheduler: SchedulerService,
        private fonnte: FonnteService,
        private ai: AiService,
    ) { }


    // ============ Users ============
    @Get('users')
    async getUsers() {
        return this.prisma.user.findMany({
            include: { pets: true },
        });
    }

    @Get('users/:id')
    async getUser(@Param('id') id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { pets: true, schedules: true },
        });
    }

    @Post('users/:id')
    async updateUser(
        @Param('id') id: string,
        @Body() data: { name?: string; phoneE164?: string; timezone?: string },
    ) {
        return this.prisma.user.update({
            where: { id },
            data,
            include: { pets: true },
        });
    }

    @Post('users')
    async createUser(
        @Body() data: { name: string; phoneE164: string; timezone?: string },
    ) {
        return this.prisma.user.create({
            data: {
                name: data.name,
                phoneE164: data.phoneE164,
                timezone: data.timezone || 'Asia/Jakarta',
            },
            include: { pets: true },
        });
    }


    // ============ Pets ============
    @Get('pets')
    async getPets() {
        return this.prisma.pet.findMany({
            include: { user: true },
        });
    }

    @Get('pets/:id')
    async getPet(@Param('id') id: string) {
        return this.prisma.pet.findUnique({
            where: { id },
            include: { user: true, schedules: { include: { template: true } } },
        });
    }

    @Post('pets')
    async createPet(
        @Body() data: { userId: string; name: string; species?: string; tankLiters?: number },
    ) {
        // Create pet
        const pet = await this.prisma.pet.create({
            data: {
                userId: data.userId,
                name: data.name,
                species: data.species || 'Betta',
                tankLiters: data.tankLiters || 2.6,
            },
            include: { user: true },
        });

        // Auto-create default schedules for the new pet
        const templates = await this.prisma.messageTemplate.findMany();
        const defaultCrons: Record<string, string> = {
            daily: '0 9 * * *',
            bi_daily: '0 9 */2 * *',
            weekly: '0 9 * * 0',
            bi_weekly: '0 9 1,15 * *',
        };

        for (const template of templates) {
            if (template.key !== 'emergency' && defaultCrons[template.key]) {
                const schedule = await this.prisma.schedule.create({
                    data: {
                        userId: data.userId,
                        petId: pet.id,
                        templateId: template.id,
                        cron: defaultCrons[template.key],
                        enabled: true,
                    },
                    include: { user: true, pet: true, template: true },
                });
                this.scheduler.scheduleJob(schedule);
            }
        }

        return pet;
    }

    // ============ Templates ============
    @Get('templates')
    async getTemplates() {
        return this.prisma.messageTemplate.findMany();
    }

    // ============ Schedules ============
    @Get('schedules')
    async getSchedules() {
        return this.prisma.schedule.findMany({
            include: { user: true, pet: true, template: true },
        });
    }

    @Post('schedules')
    async createSchedule(
        @Body()
        data: {
            userId: string;
            petId: string;
            templateId: string;
            cron: string;
            enabled?: boolean;
        },
    ) {
        const schedule = await this.prisma.schedule.create({
            data: {
                userId: data.userId,
                petId: data.petId,
                templateId: data.templateId,
                cron: data.cron,
                enabled: data.enabled ?? true,
            },
            include: { user: true, pet: true, template: true },
        });

        // Refresh scheduler
        await this.scheduler.refreshSchedule(schedule.id);

        return schedule;
    }

    @Post('schedules/:id/toggle')
    async toggleSchedule(@Param('id') id: string) {
        const schedule = await this.prisma.schedule.findUnique({ where: { id } });
        if (!schedule) {
            return { error: 'Schedule not found' };
        }

        const updated = await this.prisma.schedule.update({
            where: { id },
            data: { enabled: !schedule.enabled },
        });

        await this.scheduler.refreshSchedule(id);

        return updated;
    }

    // ============ Logs ============
    @Get('logs')
    async getLogs(@Query('petId') petId?: string, @Query('limit') limit?: string) {
        return this.prisma.messageLog.findMany({
            where: petId ? { petId } : undefined,
            include: { template: true, pet: true },
            orderBy: { sentAt: 'desc' },
            take: limit ? parseInt(limit) : 50,
        });
    }

    // ============ Emergency ============
    @Post('emergency/:petId')
    async triggerEmergency(@Param('petId') petId: string) {
        this.logger.warn(`Emergency triggered for pet: ${petId}`);
        return this.scheduler.sendEmergency(petId);
    }

    // ============ Test ============
    @Post('test/send')
    async testSend(@Body() data: { phone: string; message: string }) {
        return this.fonnte.sendMessage(data.phone, data.message);
    }

    // ============ Journal ============
    @Get('journal')
    async getJournal(@Query('petId') petId?: string) {
        return this.prisma.journalEntry.findMany({
            where: petId ? { petId } : undefined,
            include: { pet: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Post('journal')
    async createJournal(
        @Body() data: { petId: string; userId: string; content: string },
    ) {
        return this.prisma.journalEntry.create({
            data: {
                petId: data.petId,
                userId: data.userId,
                content: data.content,
            },
            include: { pet: true },
        });
    }

    @Put('journal/:id')
    async updateJournal(
        @Param('id') id: string,
        @Body() data: { content: string },
    ) {
        return this.prisma.journalEntry.update({
            where: { id },
            data: { content: data.content },
            include: { pet: true },
        });
    }

    @Delete('journal/:id')
    async deleteJournal(@Param('id') id: string) {
        await this.prisma.journalEntry.delete({
            where: { id },
        });
        return { success: true, message: 'Journal entry deleted' };
    }

    // ============ AI Assistant ============
    @Get('ai/predict')
    async getPrediction(@Query('petId') petId: string) {
        // Fetch recent journal entries and logs for context
        const entries = await this.prisma.journalEntry.findMany({
            where: { petId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const logs = await this.prisma.messageLog.findMany({
            where: { petId },
            include: { template: true },
            orderBy: { sentAt: 'desc' },
            take: 5,
        });

        const context = [
            ...entries.map(e => `[${e.createdAt.toISOString()}] Journal: ${e.content}`),
            ...logs.map(l => `[${l.sentAt.toISOString()}] Event: ${l.template.title}`),
        ].join('\n');

        const prediction = await this.ai.predictSituation(context);
        return { prediction };
    }

    @Post('ai/ask')

    async askAi(@Body() data: { question: string }) {
        const answer = await this.ai.ask(data.question);
        return { answer };
    }
}


