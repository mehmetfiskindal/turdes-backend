import { ApiProperty } from '@nestjs/swagger';
import { CustomFieldType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateCustomFieldDefinitionDto {
  @ApiProperty({ description: 'Alan adı', example: 'İletişim Tercihi' })
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @ApiProperty({
    description: 'Alan tipi',
    enum: CustomFieldType,
    example: CustomFieldType.TEXT,
  })
  @IsEnum(CustomFieldType)
  fieldType: CustomFieldType;

  @ApiProperty({
    description: 'SELECT tipi için seçenekler',
    required: false,
    type: [String],
    example: ['Seçenek 1', 'Seçenek 2', 'Seçenek 3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}
