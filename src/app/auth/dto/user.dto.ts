import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  readonly name!: string; // Definite assignment assertion

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  readonly email!: string; // Definite assignment assertion

  @ApiProperty({
    example: '1234567890',
    description: 'The phone number of the user',
    required: false, // Telefon alanı opsiyonel olduğundan `required: false` ekleyelim
  })
  readonly phone!: string; // Definite assignment assertion

  @ApiProperty({
    example: 'Password123',
    description: 'The password of the user',
  })
  readonly password!: string; // Definite assignment assertion

  @ApiProperty({
    example: 'user',
    description:
      'The role of the user (note: admin role can only be set via DB script)',
    required: false,
  })
  readonly role?: string; // Opsiyonel alan, kullanıcı tarafından belirtilmediğinde 'user' olacak
}
