import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Shared application wiring used by both the real bootstrap (main.ts)
 * and e2e tests, so tests exercise the exact same HTTP pipeline.
 */
export function configureApp(app: INestApplication): void {
  app.enableCors({ origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
