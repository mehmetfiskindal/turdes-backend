import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';
import { RoleGuard } from '../auth/role.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get comprehensive analytics dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved comprehensive analytics.',
  })
  @Get('analytics')
  @Roles(Role.Admin)
  async getComprehensiveAnalytics() {
    return this.dashboardService.getComprehensiveAnalytics();
  }

  @ApiOperation({ summary: 'Get aid distribution statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved aid distribution statistics.',
  })
  @Get('aid-distribution')
  @Roles(Role.Admin)
  async getAidDistributionStats() {
    return this.dashboardService.getAidDistributionStats();
  }

  @ApiOperation({ summary: 'Get user category statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user category statistics.',
  })
  @Get('user-categories')
  @Roles(Role.Admin)
  async getUserCategoryStats() {
    return this.dashboardService.getUserCategoryStats();
  }

  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved organization statistics.',
  })
  @Get('organizations')
  @Roles(Role.Admin)
  async getOrganizationStats() {
    return this.dashboardService.getOrganizationStats();
  }

  @ApiOperation({ summary: 'Get donation statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved donation statistics.',
  })
  @Get('donations')
  @Roles(Role.Admin)
  async getDonationStats() {
    return this.dashboardService.getDonationStats();
  }

  @ApiOperation({ summary: 'Get aid efficiency statistics by location' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved aid efficiency by location.',
  })
  @Get('aid-efficiency-by-location')
  @Roles(Role.Admin)
  async getAidEfficiencyByLocation() {
    return this.dashboardService.getAidEfficiencyByLocation();
  }

  // Yeni eklenen metrik endpoint'leri - Viewer rolü ve üstü erişebilir

  @ApiOperation({ summary: 'Get total number of stakeholders' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved total stakeholders count.',
  })
  @Get('total-stakeholders')
  @Roles(Role.Viewer, Role.Admin)
  async getTotalStakeholders() {
    return this.dashboardService.getTotalStakeholders();
  }

  @ApiOperation({ summary: 'Get new stakeholders for a specific period' })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved new stakeholders count for the period.',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date for period (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date for period (YYYY-MM-DD)',
  })
  @Get('new-stakeholders')
  @Roles(Role.Viewer, Role.Admin)
  async getNewStakeholdersThisPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getNewStakeholdersThisPeriod(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @ApiOperation({ summary: 'Get total donations amount' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved total donations amount.',
  })
  @Get('total-donations-amount')
  @Roles(Role.Viewer, Role.Admin)
  async getTotalDonationsAmount() {
    return this.dashboardService.getTotalDonationsAmount();
  }

  @ApiOperation({ summary: 'Get active campaigns summary' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved active campaigns summary.',
  })
  @Get('active-campaigns')
  @Roles(Role.Viewer, Role.Admin)
  async getActiveCampaignsSummary() {
    return this.dashboardService.getActiveCampaignsSummary();
  }

  @ApiOperation({ summary: 'Get upcoming tasks count' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved upcoming tasks count.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Optional user ID to filter tasks',
  })
  @Get('upcoming-tasks')
  @Roles(Role.Viewer, Role.Admin)
  async getUpcomingTasksCount(@Query('userId') userId?: string) {
    return this.dashboardService.getUpcomingTasksCount(userId);
  }

  @ApiOperation({ summary: 'Get donations over time by period' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved donations over time.',
  })
  @ApiParam({
    name: 'period',
    enum: ['DAY', 'WEEK', 'MONTH', 'YEAR'],
    description: 'Time period for grouping',
  })
  @Get('donations-over-time/:period')
  @Roles(Role.Viewer, Role.Admin)
  async getDonationsOverTime(
    @Param('period') period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR',
  ) {
    return this.dashboardService.getDonationsOverTime(period);
  }
}
