import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [CampaignsService, PrismaService],
  controllers: [CampaignsController],
})
export class CampaignsModule {}
