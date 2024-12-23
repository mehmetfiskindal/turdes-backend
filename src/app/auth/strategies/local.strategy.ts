import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Varsayılan olarak "username" kullanılır, burada "email" kullanılmasını sağlıyoruz
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    console.log('Validating user:', { email, password }); // Add logging
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.log('Invalid credentials'); // Add logging
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // Passport bu kullanıcıyı req.user içerisine yerleştirir
  }
}
