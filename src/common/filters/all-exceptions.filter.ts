import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: any;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.createErrorResponse(exception, request);

    this.logger.error(
      `Error occurred: ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private createErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // HTTP Exception
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return {
        success: false,
        statusCode: status,
        message:
          typeof response === 'string' ? response : (response as any).message,
        error: exception.name,
        timestamp,
        path,
        details: typeof response === 'object' ? response : undefined,
      };
    }

    // Prisma Errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, timestamp, path);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Veri doğrulama hatası',
        error: 'ValidationError',
        timestamp,
        path,
        details: exception.message,
      };
    }

    // Validation Errors (class-validator)
    if (exception instanceof Error && exception.name === 'ValidationError') {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Girdi doğrulama hatası',
        error: 'ValidationError',
        timestamp,
        path,
        details: exception.message,
      };
    }

    // Generic Error
    const message =
      exception instanceof Error ? exception.message : 'Bilinmeyen hata';
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      error: 'InternalServerError',
      timestamp,
      path,
    };
  }

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    timestamp: string,
    path: string,
  ): ErrorResponse {
    switch (error.code) {
      case 'P2002':
        return {
          success: false,
          statusCode: HttpStatus.CONFLICT,
          message: 'Bu veri zaten mevcut (benzersizlik ihlali)',
          error: 'ConflictError',
          timestamp,
          path,
          details: error.meta,
        };

      case 'P2025':
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'İstenen kayıt bulunamadı',
          error: 'NotFoundError',
          timestamp,
          path,
          details: error.meta,
        };

      case 'P2003':
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'İlişkili veri kısıtlaması ihlali',
          error: 'RelationError',
          timestamp,
          path,
          details: error.meta,
        };

      default:
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Veritabanı hatası',
          error: 'DatabaseError',
          timestamp,
          path,
          details: error.meta,
        };
    }
  }
}
