import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateAidRequestDto {
  @ApiProperty()
  @IsString()
  readonly type: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty({ required: false })
  @IsString()
  readonly status: string;

  @ApiProperty()
  readonly userId: number;

  @ApiProperty()
  readonly organizationId: number;

  @ApiProperty()
  readonly locationId: number;

  @ApiProperty({ required: true, default: false })
  readonly isDeleted: boolean;

  @ApiProperty()
  @IsNumber()
  readonly latitude: number;

  @ApiProperty()
  @IsNumber()
  readonly longitude: number;

  @ApiProperty({ required: false, default: false })
  readonly recurring: boolean;
}
