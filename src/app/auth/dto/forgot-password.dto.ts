import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address of the user requesting password reset',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Lütfen geçerli bir e-posta adresi girin.' })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz.' })
  email: string;
}
