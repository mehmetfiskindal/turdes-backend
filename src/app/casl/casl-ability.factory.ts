import {
  PureAbility,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Action } from './action';
import { User } from '@prisma/client'; // Prisma'dan gelen User modelini kullanıyoruz

// Uygulamadaki farklı nesne türleri
export type Subjects = 'User' | 'Post' | 'Comment' | 'AidRequest' | 'all';

export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    // AbilityBuilder ile yetenekleri tanımlıyoruz
    const { can, cannot, build } = new AbilityBuilder<
      PureAbility<[Action, Subjects]>
    >(PureAbility as AbilityClass<AppAbility>);

    if (user.role === 'admin') {
      // Admin can perform all actions on all resources
      can(Action.Manage, 'all');
    } else if (user.role === 'organization_owner') {
      // Organization owners can manage their own resources
      can(Action.Manage, ['AidRequest', 'Post']);
      can(Action.Read, 'all');
    } else if (user.role === 'volunteer') {
      // Volunteers can read and update specific resources
      can(Action.Read, ['AidRequest', 'Post']);
      can(Action.Update, 'AidRequest', { assignedTo: user.id });
    } else {
      // Default permissions for other users
      can(Action.Read, ['User', 'Post', 'Comment', 'AidRequest']);
      cannot(Action.Delete, ['User', 'Post', 'Comment', 'AidRequest']);
      cannot(Action.Update, 'AidRequest', { status: true });
    }

    return build({
      detectSubjectType: (item: unknown) =>
        item.constructor.name as ExtractSubjectType<Subjects>,
    });
  }
}
