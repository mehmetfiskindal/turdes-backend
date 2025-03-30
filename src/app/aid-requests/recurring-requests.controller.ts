import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { RecurringRequestsService } from './recurring-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { Req } from '@nestjs/common';

@ApiTags('recurring-aid-requests')
@Controller('recurring-aid-requests')
export class RecurringRequestsController {
  constructor(private readonly recurringRequestsService: RecurringRequestsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a schedule for a recurring aid request' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created recurring aid request schedule.',
  })
  @Post(':id/schedule')
  async createSchedule(
    @Param('id') aidRequestId: number,
    @Body() scheduleDto: {
      frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
      dayOfWeek?: number;
      dayOfMonth?: number;
      timeOfDay: string;
      endDate?: Date;
    },
  ) {
    return this.recurringRequestsService.createRecurringAidRequestSchedule(
      aidRequestId,
      scheduleDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all recurring aid requests for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved recurring aid requests.',
  })
  @Get()
  async getRecurringRequests(@Req() req: RequestWithUser) {
    return this.recurringRequestsService.getUserRecurringRequests(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger processing of recurring aid requests (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully processed recurring aid requests.',
  })
  @Post('process')
  async processRecurringRequests() {
    return this.recurringRequestsService.processRecurringRequests();
  }
}