import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Generate aid distribution report' })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated aid distribution report.',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'The start date for the report',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'The end date for the report',
    required: true,
  })
  @Get('aid-distribution')
  async generateAidDistributionReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.generateAidDistributionReport(
      startDate,
      endDate,
    );
  }

  @ApiOperation({ summary: 'Generate donation distribution report' })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated donation distribution report.',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'The start date for the report',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'The end date for the report',
    required: true,
  })
  @Get('donation-distribution')
  async generateDonationDistributionReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.generateDonationDistributionReport(
      startDate,
      endDate,
    );
  }
}
