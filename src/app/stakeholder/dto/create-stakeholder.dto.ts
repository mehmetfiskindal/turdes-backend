import { ApiProperty } from '@nestjs/swagger'; // ApiProperty'yi import et
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsDateString,
  IsObject,
} from 'class-validator';
import { StakeholderType, EngagementLevel } from '@prisma/client'; // Import enums from Prisma Client

export class CreateStakeholderDto {
  @ApiProperty({
    enum: StakeholderType,
    description: 'Paydaşın türü (örn: DONOR, VOLUNTEER)',
    example: StakeholderType.INDIVIDUAL_DONOR,
  })
  @IsEnum(StakeholderType)
  @IsNotEmpty()
  type: StakeholderType;

  @ApiProperty({
    description: 'Paydaşın adı veya kurum adı',
    example: 'Ahmet Yılmaz Vakfı',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'İletişim kurulacak kişi (kurum ise)',
    example: 'Ayşe Demir',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({
    description: 'Paydaşın e-posta adresi',
    example: 'iletisim@ahmetvakfi.org',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Paydaşın telefon numarası',
    example: '+90 555 123 4567',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Paydaşın adresi',
    example: 'Örnek Mah. Test Sok. No:1 D:2, İstanbul',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  // New optional fields
  @ApiProperty({
    description: 'Bağış geçmişi (JSON formatında)',
    example: { totalDonated: 5000, lastDonationDate: '2024-12-01' },
    required: false,
    // type: 'object', // Removed: 'object' is not a valid type string here. Swagger might infer or use 'any'.
  })
  @IsObject()
  @IsOptional()
  // Add specific validation if the JSON structure is known
  // e.g., @ValidateNested({ each: true }) @Type(() => DonationHistoryEntryDto)
  donationHistory?: any; // Prisma expects Json type, validation depends on structure

  @ApiProperty({
    description: 'Paydaş tercihleri (JSON formatında)',
    example: { communicationFrequency: 'monthly', preferredChannel: 'email' },
    required: false,
    // type: 'object', // Removed: 'object' is not a valid type string here. Swagger might infer or use 'any'.
  })
  @IsObject()
  @IsOptional()
  // Add specific validation if the JSON structure is known
  // e.g., @ValidateNested() @Type(() => PreferencesDto)
  preferences?: any; // Prisma expects Json type, validation depends on structure

  @ApiProperty({
    description: 'Son iletişim tarihi (ISO 8601 formatında)',
    example: '2025-03-15T10:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  lastContacted?: string;

  @ApiProperty({
    enum: EngagementLevel,
    description: 'Etkileşim seviyesi',
    example: EngagementLevel.HIGH,
    required: false,
  })
  @IsEnum(EngagementLevel)
  @IsOptional()
  engagementLevel?: EngagementLevel;
}
