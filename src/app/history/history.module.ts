import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [HistoryService, PrismaService],
  controllers: [HistoryController],
})
export class HistoryModule {}
