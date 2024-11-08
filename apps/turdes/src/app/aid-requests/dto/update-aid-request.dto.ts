import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateAidRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly longitude?: number;

  @ApiProperty({ required: false })
  readonly isDeleted?: boolean;
}
