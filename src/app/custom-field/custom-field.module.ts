import { Module } from '@nestjs/common';
import { CustomFieldDefinitionService } from './custom-field-definition.service';
import { CustomFieldDefinitionController } from './custom-field-definition.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CustomFieldDefinitionController],
  providers: [CustomFieldDefinitionService, PrismaService],
  exports: [CustomFieldDefinitionService],
})
export class CustomFieldModule {}
