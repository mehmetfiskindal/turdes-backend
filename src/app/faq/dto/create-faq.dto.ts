import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty()
  @IsString()
  readonly question: string;

  @ApiProperty()
  @IsString()
  readonly answer: string;
}
