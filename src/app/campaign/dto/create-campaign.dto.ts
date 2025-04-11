import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus, CampaignType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Kampanya adı' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Kampanya açıklaması' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Hedeflenen bağış miktarı' })
  @IsDecimal()
  @IsOptional()
  goalAmount?: number;

  @ApiPropertyOptional({ description: 'Başlangıç tarihi' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Bitiş tarihi' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Kampanya türü', enum: CampaignType })
  @IsEnum(CampaignType)
  @IsNotEmpty()
  type: CampaignType;

  @ApiPropertyOptional({
    description: 'Kampanya durumu',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiProperty({ description: 'Organizasyon ID' })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  organizationId: number;
}
