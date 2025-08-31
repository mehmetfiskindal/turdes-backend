import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiProperty } from '@nestjs/swagger';

export class StandardResponse<T> {
  @ApiProperty({ description: 'Başarı durumu' })
  success: boolean;

  @ApiProperty({ description: 'HTTP durum kodu' })
  statusCode: number;

  @ApiProperty({ description: 'Yanıt mesajı' })
  message: string;

  @ApiProperty({ description: 'Yanıt verisi' })
  data: T;

  @ApiProperty({ description: 'Zaman damgası' })
  timestamp: string;

  @ApiProperty({ description: 'İstek yolu' })
  path: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode || HttpStatus.OK,
        message: this.getSuccessMessage(request.method),
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }

  private getSuccessMessage(method: string): string {
    const messages = {
      GET: 'Veri başarıyla getirildi',
      POST: 'Veri başarıyla oluşturuldu',
      PUT: 'Veri başarıyla güncellendi',
      PATCH: 'Veri başarıyla güncellendi',
      DELETE: 'Veri başarıyla silindi',
    };

    return messages[method] || 'İşlem başarıyla tamamlandı';
  }
}
