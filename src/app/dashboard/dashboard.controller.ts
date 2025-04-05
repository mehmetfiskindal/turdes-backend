import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';
import { RoleGuard } from '../auth/role.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
@Roles(Role.Admin)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get comprehensive analytics dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved comprehensive analytics.',
  })
  @Get('analytics')
  async getComprehensiveAnalytics() {
    return this.dashboardService.getComprehensiveAnalytics();
  }

  @ApiOperation({ summary: 'Get aid distribution statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved aid distribution statistics.',
  })
  @Get('aid-distribution')
  async getAidDistributionStats() {
    return this.dashboardService.getAidDistributionStats();
  }

  @ApiOperation({ summary: 'Get user category statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user category statistics.',
  })
  @Get('user-categories')
  async getUserCategoryStats() {
    return this.dashboardService.getUserCategoryStats();
  }

  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved organization statistics.',
  })
  @Get('organizations')
  async getOrganizationStats() {
    return this.dashboardService.getOrganizationStats();
  }

  @ApiOperation({ summary: 'Get donation statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved donation statistics.',
  })
  @Get('donations')
  async getDonationStats() {
    return this.dashboardService.getDonationStats();
  }

  @ApiOperation({ summary: 'Get aid efficiency statistics by location' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved aid efficiency by location.',
  })
  @Get('aid-efficiency-by-location')
  async getAidEfficiencyByLocation() {
    return this.dashboardService.getAidEfficiencyByLocation();
  }
}
