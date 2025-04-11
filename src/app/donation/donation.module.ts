import { Module } from '@nestjs/common';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [DonationService, PrismaService],
  controllers: [DonationController],
})
export class DonationModule {}
