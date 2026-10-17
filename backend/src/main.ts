import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  const config = app.get<ConfigService<AppConfig>>(ConfigService);
  const port = config.get<number>('port', 5000);

  await app.listen(port);
  Logger.log(`Backend is running on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
