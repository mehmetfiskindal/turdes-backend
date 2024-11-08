import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly type: string;

  @ApiProperty()
  @IsString()
  readonly mission: string;

  @ApiProperty()
  @IsString()
  readonly address: string;

  @ApiProperty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  @IsString()
  readonly email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly socialMedia?: string;

  @ApiProperty()
  @IsString()
  readonly contactName: string;

  @ApiProperty()
  @IsString()
  readonly contactPhone: string;

  @ApiProperty()
  @IsString()
  readonly contactEmail: string;

  @ApiProperty()
  @IsString()
  readonly donationAccount: string;

  @ApiProperty()
  @IsString()
  readonly iban: string;

  @ApiProperty()
  @IsString()
  readonly taxNumber: string;

  @ApiProperty()
  @IsString()
  readonly aidTypes: string;

  @ApiProperty()
  @IsString()
  readonly targetAudience: string;

  @ApiProperty()
  @IsString()
  readonly volunteerNeeds: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly activeProjects?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly events?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly logo?: string;

  @ApiProperty()
  readonly establishedDate: Date;

  @ApiProperty()
  readonly latitude: number;

  @ApiProperty()
  readonly longitude: number;
}
