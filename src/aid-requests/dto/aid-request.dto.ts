import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class AidRequestDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the user making the aid request',
  })
  @IsInt()
  readonly userId: number;

  @ApiProperty({
    example: 'Food Assistance',
    description: 'The type of aid being requested',
  })
  @IsString()
  @IsNotEmpty()
  readonly type: string;

  @ApiProperty({
    example: 'Need food for a family of four',
    description: 'Detailed description of the aid request',
  })
  @IsString()
  @MinLength(10)
  readonly description: string;
}
