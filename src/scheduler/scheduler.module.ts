import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { FonnteModule } from '../fonnte';

@Module({
    imports: [FonnteModule],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
