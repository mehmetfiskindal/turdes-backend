import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonationStatus, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDonationDto {
  @ApiProperty({ description: 'Bağış miktarı' })
  @IsDecimal()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    description: 'Bağış tarihi',
    default: 'Otomatik olarak şimdiki zaman atanır',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  donationDate?: Date;

  @ApiProperty({
    description: 'Ödeme yöntemi',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Bağış durumu',
    enum: DonationStatus,
    default: DonationStatus.PENDING,
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

  @ApiPropertyOptional({
    description: 'Anonim bağış mı?',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  anonymous?: boolean;
}
