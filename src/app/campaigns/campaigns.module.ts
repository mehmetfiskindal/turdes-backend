import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';

@Module({
  imports: [],
  providers: [CampaignsService],
  controllers: [CampaignsController],
})
export class CampaignsModule {}
