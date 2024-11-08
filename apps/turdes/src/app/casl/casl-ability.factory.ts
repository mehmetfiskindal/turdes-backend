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
      // Admin ise tüm nesnelerde tüm eylemleri gerçekleştirebilir
      can(Action.Manage, 'all');
    } else {
      // Diğer kullanıcılar sadece okuma iznine sahiptir
      can(Action.Read, ['User', 'Post', 'Comment', 'AidRequest']);

      // Diğer kullanıcıların yapamayacağı işlemler
      cannot(Action.Delete, ['User', 'Post', 'Comment', 'AidRequest']); // Silme yetkisi yok
      cannot(Action.Update, 'AidRequest', { status: true }); // status alanını güncelleme yetkisi yok
    }

    return build({
      detectSubjectType: (item: unknown) =>
        item.constructor.name as ExtractSubjectType<Subjects>,
    });
  }
}
