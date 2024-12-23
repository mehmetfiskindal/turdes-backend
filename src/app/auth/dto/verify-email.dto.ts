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
    example: '123456',
    description: 'The verification code sent to the user',
  })
  @IsString()
  readonly verificationCode: string;
}
