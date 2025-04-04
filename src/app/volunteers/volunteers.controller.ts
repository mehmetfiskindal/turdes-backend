import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

@ApiTags('volunteers')
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new volunteer' })
  @ApiResponse({
    status: 201,
    description: 'The volunteer has been successfully registered.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateVolunteerDto })
  @Post('register')
  async register(@Body() createVolunteerDto: CreateVolunteerDto) {
    return this.volunteersService.register(createVolunteerDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a task to a volunteer' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully assigned to the volunteer.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiParam({
    name: 'volunteerId',
    description: 'The ID of the volunteer to assign the task',
  })
  @ApiParam({
    name: 'taskId',
    description: 'The ID of the task to assign',
  })
  @ApiBody({ type: AssignTaskDto })
  @Post('assign-task')
  async assignTask(@Body() assignTaskDto: AssignTaskDto) {
    return this.volunteersService.assignTask(assignTaskDto);
  }
}
