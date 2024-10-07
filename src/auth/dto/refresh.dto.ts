import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'your-refresh-token-here',
    description: 'Refresh token to generate a new access token',
  })
  @IsString()
  readonly refreshToken: string;
}
