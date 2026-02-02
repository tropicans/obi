import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { FonnteModule } from '../fonnte';
import { AiModule } from '../ai';

@Module({
    imports: [FonnteModule, AiModule],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
