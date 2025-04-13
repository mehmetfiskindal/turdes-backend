import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, DashboardService],
  controllers: [DashboardController],

  exports: [PrismaService, DashboardService],
  imports: [],
})
export class DashboardModule {}
