import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const result = super.canActivate(context);
    if (result instanceof Observable) {
      return result
        .pipe(map((value) => !!value))
        .toPromise() as Promise<boolean>;
    }
    return result as boolean;
  }
}
