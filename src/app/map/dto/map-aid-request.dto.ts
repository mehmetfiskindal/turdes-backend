import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class MapAidRequestDto {
  @ApiProperty({ example: 40.7128, description: 'Latitude of the aid request location' })
  @IsNumber()
  readonly latitude: number;

  @ApiProperty({ example: -74.0060, description: 'Longitude of the aid request location' })
  @IsNumber()
  readonly longitude: number;

  @ApiProperty({ example: 'Pending', description: 'Status of the aid request' })
  @IsString()
  readonly status: string;
}
