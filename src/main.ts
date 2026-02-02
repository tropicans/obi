import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for production
  app.enableCors({
    origin: [
      'http://localhost:3006',
      'http://localhost:5173',
      'https://obi.kelazz.my.id',
      'http://obi.kelazz.my.id',
    ],
    credentials: true,
  });

  // Serve static files from public folder
  app.useStaticAssets(join(process.cwd(), 'public'));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3007;

  await app.listen(port);
  logger.log(`🐠 Obi Reminder running on http://localhost:${port}`);
  logger.log(`🌐 Web UI: http://localhost:${port}`);
  logger.log(`📡 Webhook endpoint: http://localhost:${port}/webhook/fonnte`);
  logger.log(`📋 API endpoint: http://localhost:${port}/api`);
}
bootstrap();

