import {
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  IsDate,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
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

export class AmountRangeDto {
  @ApiProperty({ required: false, description: 'Minimum miktar' })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiProperty({ required: false, description: 'Maksimum miktar' })
  @IsOptional()
  @IsNumber()
  max?: number;
}

export class CustomFieldFilterDto {
  @ApiProperty({ description: 'Özel alan adı' })
  @IsString()
  fieldName: string;

  @ApiProperty({ description: 'Özel alan değeri' })
  @IsString()
  value: string;
}

export class FindSegmentedStakeholdersDto {
  @ApiProperty({ required: false, description: 'Paydaş tipi' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    required: false,
    description: "Etiket ID'leri",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({ required: false, description: 'Toplam bağış miktarı aralığı' })
  @IsOptional()
  @IsObject()
  @Type(() => AmountRangeDto)
  totalDonationAmount?: AmountRangeDto;

  @ApiProperty({ required: false, description: 'Son bağış tarihi aralığı' })
  @IsOptional()
  @IsObject()
  @Type(() => DateRangeDto)
  lastDonationDate?: DateRangeDto;

  @ApiProperty({ required: false, description: 'Adres içinde aranacak kelime' })
  @IsOptional()
  @IsString()
  locationKeyword?: string;

  @ApiProperty({
    required: false,
    description: 'Özel alan filtreleri',
    type: [CustomFieldFilterDto],
  })
  @IsOptional()
  @IsArray()
  @Type(() => CustomFieldFilterDto)
  customFields?: CustomFieldFilterDto[];

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
