// AidRequests Module (aid-requests/aid-requests.module.ts)
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AidRequestsService } from './aid-requests.service';
import { AidRequestsController } from './aid-requests.controller';
import { AidRequest } from './models/aid-request.model';

@Module({
  imports: [SequelizeModule.forFeature([AidRequest])],
  providers: [AidRequestsService],
  controllers: [AidRequestsController],
})
export class AidRequestsModule {}
