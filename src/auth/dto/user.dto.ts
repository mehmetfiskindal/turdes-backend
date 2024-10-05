// UserDto (auth/dto/user.dto.ts)
export class UserDto {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly password: string;
  readonly role: string;
}
