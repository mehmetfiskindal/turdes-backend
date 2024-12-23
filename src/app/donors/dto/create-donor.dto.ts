import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsPhoneNumber, IsArray } from 'class-validator';

export class CreateDonorDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsPhoneNumber()
  readonly phone: string;

  @ApiProperty()
  @IsArray()
  readonly donationHistory: string[];
}
