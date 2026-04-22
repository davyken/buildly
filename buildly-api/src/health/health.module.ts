import { Controller, Get, Module } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection) {}

  @Public()
  @Get()
  check() {
    const mongoOk = this.mongoConnection.readyState === 1;
    return {
      status: mongoOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: { mongodb: mongoOk ? 'connected' : 'disconnected', api: 'ok' },
      version: process.env.npm_package_version ?? '1.0.0',
    };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
