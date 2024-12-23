import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('history')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user request history' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user request history.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user to retrieve request history',
  })
  @Get('user/:userId')
  async getUserRequestHistory(@Param('userId') userId: number) {
    return this.historyService.getUserRequestHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization request history' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved organization request history.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({
    name: 'organizationId',
    description: 'The ID of the organization to retrieve request history',
  })
  @Get('organization/:organizationId')
  async getOrganizationRequestHistory(@Param('organizationId') organizationId: number) {
    return this.historyService.getOrganizationRequestHistory(organizationId);
  }
}
