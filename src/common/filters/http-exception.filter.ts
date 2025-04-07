import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'İşlem sırasında beklenmeyen bir hata oluştu';
    let error = 'Internal Server Error';

    // Eğer HttpException tipinde bir hata ise
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // İçeriğe göre mesaj ve hata ayarlanır
      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse.message || message;
        error = exceptionResponse.error || this.getDefaultErrorMessage(status);
      } else {
        message = exceptionResponse || message;
        error = this.getDefaultErrorMessage(status);
      }
    } else if (exception.name === 'PrismaClientKnownRequestError') {
      // Prisma özel hataları için
      message = 'Veritabanı işlemi sırasında bir hata oluştu';
      error = 'Database Error';
      status = HttpStatus.BAD_REQUEST;
    }

    // Hata log'u
    this.logger.error(
      `Path: ${request.url}, Method: ${request.method}, Status: ${status}, Message: ${message}`,
      exception.stack,
    );

    // Standart hata yanıtı formatı
    response.status(status).json({
      statusCode: status,
      message: message,
      error: error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getDefaultErrorMessage(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      default:
        return 'Internal Server Error';
    }
  }
}
