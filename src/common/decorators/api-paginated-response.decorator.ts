import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Sayfalanmış veri başarıyla getirildi',
      schema: {
        allOf: [
          {
            properties: {
              success: {
                type: 'boolean',
                example: true,
              },
              statusCode: {
                type: 'number',
                example: 200,
              },
              message: {
                type: 'string',
                example: 'Veri başarıyla getirildi',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              path: {
                type: 'string',
              },
              data: {
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                  total: {
                    type: 'number',
                    description: 'Toplam kayıt sayısı',
                  },
                  page: {
                    type: 'number',
                    description: 'Mevcut sayfa numarası',
                  },
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
        ],
      },
    }),
  );
};
