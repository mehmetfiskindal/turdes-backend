import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeQueryDto {
  @ApiProperty({ required: false, description: 'Başlangıç tarihi' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start?: Date;

  @ApiProperty({ required: false, description: 'Bitiş tarihi' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end?: Date;
}

export class AmountRangeQueryDto {
  @ApiProperty({ required: false, description: 'Minimum miktar' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  min?: number;

  @ApiProperty({ required: false, description: 'Maksimum miktar' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max?: number;
}

export class FilterStakeholdersQueryDto {
  @ApiProperty({ required: false, description: 'Paydaş tipi' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    required: false,
    description: "Etiket ID'leri (virgülle ayrılmış)",
  })
  @IsOptional()
  @IsString()
  tagIds?: string; // "tag1,tag2,tag3" formatında alınacak

  @ApiProperty({
    required: false,
    description: 'Toplam bağış miktarı minimum değeri',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minDonationAmount?: number;

  @ApiProperty({
    required: false,
    description: 'Toplam bağış miktarı maksimum değeri',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDonationAmount?: number;

  @ApiProperty({ required: false, description: 'Son bağış başlangıç tarihi' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastDonationStart?: Date;

  @ApiProperty({ required: false, description: 'Son bağış bitiş tarihi' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastDonationEnd?: Date;

  @ApiProperty({ required: false, description: 'Adres içinde aranacak kelime' })
  @IsOptional()
  @IsString()
  locationKeyword?: string;

  @ApiProperty({ required: false, description: 'Özel alan adı' })
  @IsOptional()
  @IsString()
  customFieldName?: string;

  @ApiProperty({ required: false, description: 'Özel alan değeri' })
  @IsOptional()
  @IsString()
  customFieldValue?: string;

  @ApiProperty({ required: false, description: 'Sayfa numarası', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Sayfa başına kayıt sayısı',
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}
