import { Module } from '@nestjs/common';
import { AidCentersService } from './aid-centers.service';
import { AidCentersController } from './aid-centers.controller';

@Module({
  providers: [AidCentersService],
  controllers: [AidCentersController],
})
export class AidCentersModule {}
