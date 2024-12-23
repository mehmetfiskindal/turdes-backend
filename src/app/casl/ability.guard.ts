import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ForbiddenError } from '@casl/ability';
import { CaslAbilityFactory, Subjects } from './casl-ability.factory';
import { Action } from './action';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: CaslAbilityFactory
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const ability = this.abilityFactory.createForUser(user);
    const requiredAbility = this.reflector.get<[Action, Subjects]>(
      'ability',
      context.getHandler()
    );

    if (!requiredAbility) {
      return true; // Eğer bir yetkilendirme tanımı yoksa, erişime izin ver
    }

    try {
      ForbiddenError.from(ability).throwUnlessCan(...requiredAbility);
      return true;
    } catch {
      return false;
    }
  }
}
