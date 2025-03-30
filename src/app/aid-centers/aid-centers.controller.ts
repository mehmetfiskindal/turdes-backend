import { Controller, Get } from '@nestjs/common';
import { AidCentersService } from './aid-centers.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('aid-centers')
@Controller('aid-centers')
export class AidCentersController {
  constructor(private readonly aidCentersService: AidCentersService) {}

  @ApiOperation({ summary: 'Get information about local aid centers' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved information about local aid centers.',
  })
  @Get('local')
  async getLocalAidCenters() {
    return this.aidCentersService.fetchLocalAidCenters();
  }

  @ApiOperation({ summary: 'Get information about government aid services' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved information about government aid services.',
  })
  @Get('government')
  async getGovernmentAidServices() {
    return this.aidCentersService.fetchGovernmentAidServices();
  }
}
