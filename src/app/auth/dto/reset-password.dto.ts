import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user requesting a password reset',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'CurrentPassword123',
    description:
      'The current password of the user (optional for security verification)',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly currentPassword?: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'The new password for the user',
  })
  @IsString()
  readonly newPassword: string;
}
