import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface MailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

export interface AppConfig {
  port: number;
  environment: string;
  baseUrl: string;
}

@Injectable()
export class TypedConfigService {
  constructor(private readonly configService: ConfigService) {}

  get app(): AppConfig {
    return {
      port: this.configService.get<number>('PORT', 3000),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      baseUrl: this.configService.get<string>(
        'BASE_URL',
        'http://localhost:3000',
      ),
    };
  }

  get database(): DatabaseConfig {
    return {
      url: this.configService.get<string>('DATABASE_URL'),
    };
  }

  get jwt(): JwtConfig {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
      refreshSecret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      refreshExpiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ),
    };
  }

  get mail(): MailConfig {
    return {
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      user: this.configService.get<string>('MAIL_USER'),
      password: this.configService.get<string>('MAIL_PASSWORD'),
      from: this.configService.get<string>('MAIL_FROM'),
    };
  }

  get(key: string, defaultValue?: any): any {
    return this.configService.get(key, defaultValue);
  }

  isDevelopment(): boolean {
    return this.app.environment === 'development';
  }

  isProduction(): boolean {
    return this.app.environment === 'production';
  }

  isTest(): boolean {
    return this.app.environment === 'test';
  }
}
