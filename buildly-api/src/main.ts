import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.RENDERER_URL || 'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.removeHeader('X-Powered-By');
    next();
  });

  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀  Buildly API → http://localhost:${port}/api/v1`);
  logger.log(`❤️   Health    → GET /api/v1/health`);
  logger.log(`🔑  Auth      → POST /api/v1/auth/register | /auth/login`);
  logger.log(`🏗️   Sites     → GET  /api/v1/sites`);
  logger.log(`📋  Templates → GET  /api/v1/templates`);
}

bootstrap();
