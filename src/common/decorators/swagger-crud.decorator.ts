import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';

// Standard Error Response
const errorResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    statusCode: { type: 'number' },
    message: { type: 'string' },
    error: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    path: { type: 'string' },
  },
};

// CRUD Operations
export const ApiGetAll = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: 'Veriler başarıyla getirildi',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Veri başarıyla getirildi' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Geçersiz istek',
      schema: errorResponseSchema,
    }),
    ApiInternalServerErrorResponse({
      description: 'Sunucu hatası',
      schema: errorResponseSchema,
    }),
  );
};

export const ApiGetOne = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: 'Veri başarıyla getirildi',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Veri başarıyla getirildi' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Kayıt bulunamadı',
      schema: errorResponseSchema,
    }),
    ApiBadRequestResponse({
      description: 'Geçersiz istek',
      schema: errorResponseSchema,
    }),
    ApiInternalServerErrorResponse({
      description: 'Sunucu hatası',
      schema: errorResponseSchema,
    }),
  );
};

export const ApiCreateOne = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: 'Kayıt başarıyla oluşturuldu',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: 201 },
          message: { type: 'string', example: 'Veri başarıyla oluşturuldu' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Geçersiz istek verisi',
      schema: errorResponseSchema,
    }),
    ApiInternalServerErrorResponse({
      description: 'Sunucu hatası',
      schema: errorResponseSchema,
    }),
  );
};

export const ApiUpdateOne = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: 'Kayıt başarıyla güncellendi',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Veri başarıyla güncellendi' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Kayıt bulunamadı',
      schema: errorResponseSchema,
    }),
    ApiBadRequestResponse({
      description: 'Geçersiz istek verisi',
      schema: errorResponseSchema,
    }),
    ApiInternalServerErrorResponse({
      description: 'Sunucu hatası',
      schema: errorResponseSchema,
    }),
  );
};

export const ApiDeleteOne = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: 'Kayıt başarıyla silindi',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Veri başarıyla silindi' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Kayıt bulunamadı',
      schema: errorResponseSchema,
    }),
    ApiBadRequestResponse({
      description: 'Geçersiz istek',
      schema: errorResponseSchema,
    }),
    ApiInternalServerErrorResponse({
      description: 'Sunucu hatası',
      schema: errorResponseSchema,
    }),
  );
};

// Pagination with queries
export const ApiGetPaginated = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Sayfa numarası',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Sayfa başına kayıt sayısı',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Arama terimi',
    }),
    ApiOkResponse({
      description: 'Sayfalanmış veriler başarıyla getirildi',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Veri başarıyla getirildi' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: { type: 'number', description: 'Toplam kayıt sayısı' },
              page: { type: 'number', description: 'Mevcut sayfa numarası' },
              limit: {
                type: 'number',
                description: 'Sayfa başına kayıt sayısı',
              },
              totalPages: {
                type: 'number',
                description: 'Toplam sayfa sayısı',
              },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Geçersiz istek',
      schema: errorResponseSchema,
    }),
    ApiInternalServerErrorResponse({
      description: 'Sunucu hatası',
      schema: errorResponseSchema,
    }),
  );
};
