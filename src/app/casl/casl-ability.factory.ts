import { Injectable } from '@nestjs/common';
import { AbilityBuilder, AbilityClass, PureAbility } from '@casl/ability';
import type { User } from '@prisma/client';
import { Action } from './action';

// Subjects tipini güncelleyerek sadece string literallerini kullan
export type Subjects =
  | 'Stakeholder'
  | 'Interaction'
  | 'User'
  | 'AidRequest'
  | 'all';

export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    // Rol bazlı yetkilendirme (string literalleri kullanılıyor)
    if (user.role === 'ADMIN') {
      can(Action.Manage, 'all');
    } else if (user.role === 'RELATIONSHIP_MANAGER') {
      can(Action.Create, 'Stakeholder');
      can(Action.Read, 'Stakeholder');
      can(Action.Update, 'Stakeholder');
      can(Action.Create, 'Interaction');
      can(Action.Read, 'Interaction');
      can(Action.Update, 'Interaction');
      // Add permissions for AidRequest if needed for this role
      // can(Action.Read, 'AidRequest');
    } else if (user.role === 'DATA_ENTRY') {
      can(Action.Create, 'Stakeholder');
      can(Action.Read, 'Stakeholder');
      can(Action.Update, 'Stakeholder', ['contactPerson', 'phone', 'address']);
      can(Action.Create, 'Interaction');
      can(Action.Read, 'Interaction');
      // Add permissions for AidRequest if needed for this role
      // can(Action.Create, 'AidRequest');
      // can(Action.Read, 'AidRequest');
    } else if (user.role === 'VIEWER') {
      can(Action.Read, 'Stakeholder');
      can(Action.Read, 'Interaction');
      can(Action.Read, 'AidRequest'); // Viewer can read AidRequests
    }

    // Add specific AidRequest permissions based on roles if not covered by 'all'
    // Example: Allow ADMIN to manage AidRequests (already covered by 'all')
    // Example: Allow specific roles to update/delete AidRequests
    // if (user.role === 'SOME_ROLE') {
    //   can(Action.Update, 'AidRequest', { /* conditions */ });
    // }

    // build() fonksiyonunu çağırmayı unutmayın
    return build({
      // detectSubjectType kaldırıldı, çünkü yalnızca string tabanlı konular kullanıyoruz.
      // detectSubjectType: (item) =>
      //   item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
