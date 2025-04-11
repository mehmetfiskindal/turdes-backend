import { Module } from '@nestjs/common';
import { StakeholderService } from './stakeholder.service';
import { StakeholderController } from './stakeholder.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslModule } from '../casl/casl.module'; // CaslModule'ü import et

@Module({
  imports: [
    PrismaModule,
    CaslModule, // CaslAbilityFactory için CaslModule'ü ekle
  ],
  controllers: [StakeholderController],
  providers: [StakeholderService],
  exports: [StakeholderService],
})
export class StakeholderModule {}
