import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsDate()
  readonly startDate: Date;

  @ApiProperty()
  @IsDate()
  readonly endDate: Date;

  @ApiProperty()
  @IsNumber()
  readonly targetAmount: number;
}
