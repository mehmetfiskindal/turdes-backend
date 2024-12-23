import { Module } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { DonorsController } from './donors.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [DonorsService, PrismaService],
  controllers: [DonorsController],
})
export class DonorsModule {}
