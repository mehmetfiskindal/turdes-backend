import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { InteractionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInteractionDto {
  @ApiProperty({
    description: 'Etkileşim tipi',
    enum: InteractionType,
    example: 'MEETING',
  })
  @IsEnum(InteractionType)
  @IsNotEmpty()
  type: InteractionType;

  @ApiProperty({
    description: 'Etkileşim tarihi',
    example: '2025-04-12T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string; // Use string for date input, Prisma handles conversion

  @ApiProperty({
    description: 'Etkileşim notları',
    example: 'Görüşmede proje detayları konuşuldu',
  })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({
    description: "Etkileşimi kaydeden kullanıcının ID'si",
    required: false,
    example: '5f7d8a9b-1c2d-3e4f-5g6h-7i8j9k0l1m2n',
  })
  @IsString()
  @IsOptional()
  recordedByUserId?: string;

  @ApiProperty({
    description: "Paydaş ID'si",
    example: '5f7d8a9b-1c2d-3e4f-5g6h-7i8j9k0l1m2n',
  })
  @IsString()
  @IsNotEmpty()
  stakeholderId: string;
}
