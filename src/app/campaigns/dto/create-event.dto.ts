import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber } from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsDate()
  readonly date: Date;

  @ApiProperty()
  @IsString()
  readonly location: string;

  @ApiProperty()
  @IsNumber()
  readonly organizationId: number;
}
