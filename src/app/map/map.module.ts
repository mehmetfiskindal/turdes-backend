import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [MapService, PrismaService],
  controllers: [MapController],
})
export class MapModule {}
