import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  readonly content: string;

  @ApiProperty()
  @IsInt()
  readonly senderId: number; // Add senderId property

  @ApiProperty()
  @IsInt()
  readonly receiverId: number; // Add receiverId property
}
