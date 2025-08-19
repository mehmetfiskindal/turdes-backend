import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);
  constructor(private authService: AuthService) {
    // Varsayılan olarak "username" kullanılır, burada "email" kullanılmasını sağlıyoruz
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    this.logger.debug(`Validating user email=${email}`);
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      this.logger.debug('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // Passport bu kullanıcıyı req.user içerisine yerleştirir
  }
}
