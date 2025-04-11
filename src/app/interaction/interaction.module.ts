import { Module } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { InteractionController } from './interaction.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';

@Module({
  imports: [PrismaModule],
  controllers: [InteractionController],
  providers: [InteractionService, CaslAbilityFactory],
  exports: [InteractionService], // Gerekirse dışa aktar
})
export class InteractionModule {}
