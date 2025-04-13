import { Module } from '@nestjs/common';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [DonationService, PrismaService],
  controllers: [DonationController],
})
export class DonationModule {}
