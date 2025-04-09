import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { AidRequestsModule } from '../aid-requests/aid-requests.module';

@Module({
  imports: [PrismaModule, AidRequestsModule],
  controllers: [MapController],
  providers: [MapService],
  exports: [MapService],
})
export class MapModule {}
