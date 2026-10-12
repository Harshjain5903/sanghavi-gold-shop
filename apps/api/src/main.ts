import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { APP_CONFIG, AppConfig } from './config/env';

// Local development reads apps/api/.env; in production the host provides env vars.
try {
  process.loadEnvFile();
} catch {
  // No .env file present.
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(APP_CONFIG);

  app.use(helmet());
  app.enableCors({ origin: config.corsOrigins, credentials: false });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableShutdownHooks();

  await app.listen(config.port);
  console.log(`API listening on http://localhost:${config.port}/api`);
}

void bootstrap();
