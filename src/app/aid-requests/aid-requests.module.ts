// AidRequests Module (aid-requests/aid-requests.module.ts)
import { Module } from '@nestjs/common';

import { AidRequestsService } from './aid-requests.service';
import { AidRequestsController } from './aid-requests.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';

@Module({
  imports: [],
  providers: [AidRequestsService, PrismaService, FirebaseAdminService],
  controllers: [AidRequestsController],
  exports: [AidRequestsService], // AidRequestsService'i dışa aktar
})
export class AidRequestsModule {}
