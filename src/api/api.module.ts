import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { SchedulerModule } from '../scheduler';
import { FonnteModule } from '../fonnte';
import { AiModule } from '../ai/ai.module';


@Module({
    imports: [SchedulerModule, FonnteModule, AiModule],
    controllers: [ApiController],
})
export class ApiModule { }
