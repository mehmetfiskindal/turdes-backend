import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsInt()
  senderId: number;

  @ApiProperty()
  @IsInt()
  receiverId: number;

  @ApiProperty()
  @IsInt()
  organizationId: number;
}
