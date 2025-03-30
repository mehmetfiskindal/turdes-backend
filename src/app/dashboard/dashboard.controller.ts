import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Visualize aid distribution efficiency' })
  @ApiResponse({
    status: 200,
    description: 'Successfully visualized aid distribution efficiency.',
  })
  @Get('visualize-aid-distribution')
  async visualizeAidDistributionEfficiency() {
    return this.dashboardService.visualizeAidDistributionEfficiency();
  }
}
