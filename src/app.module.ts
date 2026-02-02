import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma';
import { FonnteModule } from './fonnte';
import { SchedulerModule } from './scheduler';
import { WebhookModule } from './webhook';
import { ApiModule } from './api';
import { AiModule } from './ai';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    FonnteModule,
    SchedulerModule,
    WebhookModule,
    ApiModule,
    AiModule,
    AuthModule,
  ],
})
export class AppModule { }
