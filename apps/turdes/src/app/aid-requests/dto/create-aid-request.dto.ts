import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateAidRequestDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the user making the aid request',
  })
  @IsInt()
  readonly userId: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the Organization', ///TODO: Burası yazılacak
  })
  organizationId: number;

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

  @ApiProperty({
    example: 'pending',
    description: 'aid status',
  })
  status?: string;
}
