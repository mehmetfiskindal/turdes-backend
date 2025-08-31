import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AidRequestsModule } from './aid-requests/aid-requests.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { CaslModule } from './casl/casl.module';
import { PrismaService } from './prisma/prisma.service';
import { VolunteersModule } from './volunteers/volunteers.module';
import { EducationModule } from './education/education.module';
import { DonorsModule } from './donors/donors.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { AuditModule } from './audit/audit.module';
import { AuditLogInterceptor } from './audit/audit-log.interceptor';

// Common Module ve bileşenleri
import { CommonModule } from '../common/common.module';
import { ResponseInterceptor, AllExceptionsFilter } from '../common';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development.local', '.env.development'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        HOST_URL: Joi.string().uri().optional(),
        FRONTEND_URL: Joi.string().optional(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES: Joi.string().default('1h'),
        JWT_REFRESH_EXPIRES: Joi.string().default('7d'),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().default(587),
        MAIL_USER: Joi.string().required(),
        MAIL_PASSWORD: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        AUDIT_LOG_ENABLED: Joi.string().valid('true', 'false').optional(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    CommonModule, // Common module'ü ekle
    AuthModule,
    AidRequestsModule,
    OrganizationsModule,
    CaslModule,
    DashboardModule,
    VolunteersModule,
    EducationModule,
    DonorsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
