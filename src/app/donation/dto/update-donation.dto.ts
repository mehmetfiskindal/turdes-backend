import { ApiPropertyOptional } from '@nestjs/swagger';
import { DonationStatus, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDonationDto {
  @ApiPropertyOptional({ description: 'Bağış miktarı' })
  @IsDecimal()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Bağış tarihi' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  donationDate?: Date;

  @ApiPropertyOptional({
    description: 'Ödeme yöntemi',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Bağış durumu',
    enum: DonationStatus,
  })
  @IsEnum(DonationStatus)
  @IsOptional()
  status?: DonationStatus;

  @ApiPropertyOptional({ description: 'Bağışçı ID (Stakeholder)' })
  @IsString()
  @IsOptional()
  donorId?: string;

  @ApiPropertyOptional({ description: 'Kampanya ID' })
  @IsString()
  @IsOptional()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Bağış hakkında ek notlar' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Anonim bağış mı?' })
  @IsBoolean()
  @IsOptional()
  anonymous?: boolean;
}
