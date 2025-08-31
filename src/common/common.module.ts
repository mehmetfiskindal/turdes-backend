import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypedConfigService } from './services/typed-config.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    TypedConfigService,
    ResponseInterceptor,
    AllExceptionsFilter,
    ConfigService,
  ],
  exports: [
    TypedConfigService,
    ResponseInterceptor,
    AllExceptionsFilter,
    ConfigService,
  ],
})
export class CommonModule {}
