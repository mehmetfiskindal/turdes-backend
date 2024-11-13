import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
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
  readonly latitude: number;

  @ApiProperty()
  readonly longitude: number;

  @ApiProperty({ required: true, default: false })
  readonly isDeleted: boolean;
}
