import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  readonly name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  readonly email: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The phone number of the user',
    required: false, // Telefon alanı opsiyonel olduğundan `required: false` ekleyelim
  })
  readonly phone?: string;

  @ApiProperty({
    example: 'Password123',
    description: 'The password of the user',
  })
  readonly password: string; // Kullanıcıdan şifre alınacak, bu ham şifre

  @ApiProperty({
    example: 'aid_recipient',
    description: 'The role of the user',
  })
  readonly role: string;
}
