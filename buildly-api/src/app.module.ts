import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { PublishModule } from './publish/publish.module';
import { FormsModule } from './forms/forms.module';
import { AssetsModule } from './assets/assets.module';
import { DomainsModule } from './domains/domains.module';
import { TemplatesModule } from './templates/templates.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri'),
        connectionFactory: (connection) => {
          connection.on('connected', () => console.log('✅  MongoDB connected'));
          connection.on('error', (err) => console.error('❌  MongoDB error:', err));
          return connection;
        },
      }),
    }),

    CacheModule.register({ isGlobal: true, ttl: 300000, max: 1000 }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('redis.url') || 'redis://localhost:6379';
        const url = new URL(redisUrl);
        return {
          redis: {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
            tls: redisUrl.startsWith('rediss://') ? {} : undefined,
          },
        };
      },
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('throttle.ttl', 60) * 1000,
            limit: config.get<number>('throttle.limit', 100),
          },
        ],
      }),
    }),

    AuthModule,
    UsersModule,
    SitesModule,
    PublishModule,
    FormsModule,
    AssetsModule,
    DomainsModule,
    TemplatesModule,
    HealthModule,
  ],

  providers: [
    { provide: APP_GUARD,       useClass: JwtAuthGuard },
    { provide: APP_GUARD,       useClass: ThrottlerGuard },
    { provide: APP_FILTER,      useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
