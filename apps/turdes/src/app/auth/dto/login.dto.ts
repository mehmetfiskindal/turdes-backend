import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  readonly email!: string; // Definite assignment assertion

  @ApiProperty({
    example: 'Password123',
    description: 'The password of the user',
  })
  @IsString()
  readonly password!: string; // Definite assignment assertion
}
