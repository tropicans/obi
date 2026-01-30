import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { SchedulerModule } from '../scheduler';
import { FonnteModule } from '../fonnte';

@Module({
    imports: [SchedulerModule, FonnteModule],
    controllers: [ApiController],
})
export class ApiModule { }
