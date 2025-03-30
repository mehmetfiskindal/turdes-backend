import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user to verify',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'unique-verification-token',
    description: 'The token sent to the user for email verification',
  })
  @IsString()
  readonly token: string;
}
