import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAidRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly type?: string;

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
  readonly organizationId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly locationId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly isUrgent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly verified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly reported?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly recurring?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted?: boolean;
}
