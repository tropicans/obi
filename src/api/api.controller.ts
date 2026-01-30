import { Controller, Get, Post, Param, Body, Query, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { FonnteService } from '../fonnte/fonnte.service';

@Controller('api')
export class ApiController {
    private readonly logger = new Logger(ApiController.name);

    constructor(
        private prisma: PrismaService,
        private scheduler: SchedulerService,
        private fonnte: FonnteService,
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
}
