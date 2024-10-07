// AidRequests Module (aid-requests/aid-requests.module.ts)
import { Module } from '@nestjs/common';

import { AidRequestsService } from './aid-requests.service';
import { AidRequestsController } from './aid-requests.controller';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [],
  providers: [AidRequestsService, PrismaService],
  controllers: [AidRequestsController],
})
export class AidRequestsModule {}
