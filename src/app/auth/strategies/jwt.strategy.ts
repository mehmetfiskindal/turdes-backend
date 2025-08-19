import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        configService.get<string>('JWT_SECRET'),
      issuer: configService.get<string>('JWT_ISSUER') || undefined,
      audience: configService.get<string>('JWT_AUDIENCE') || undefined,
    });
  }

  async validate(payload: any) {
    // Touch configService to satisfy TS (could be used for dynamic issuer/audience validation later)
    const issuer = this.configService.get<string>('JWT_ISSUER'); // read
    if (issuer) {
      // no-op branch to keep potential future logic placeholder
    }
    const principalEmail = payload.email; // email now mandatory
    if (!principalEmail) {
      throw new UnauthorizedException('Invalid token payload: missing email');
    }
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.email !== principalEmail) {
      // Optional strict check could be enforced later; for now just reject mismatch
      throw new UnauthorizedException('Token principal mismatch');
    }
    // Optional: could verify principalEmail === user.email for extra safety
    return user;
  }
}
