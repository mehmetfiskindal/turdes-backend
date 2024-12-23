import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  readonly content: string;
}
