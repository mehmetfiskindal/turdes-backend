import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { AidRequestsService } from './aid-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';

@ApiTags('aidrequests')
@Controller('aidrequests')
export class AidRequestsController {
  constructor(private readonly aidRequestsService: AidRequestsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all aid requests' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all aid requests.',
  })
  @Get()
  async findAll(@Req() req) {
    const userId = req.user.id;
    return this.aidRequestsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new aid request' })
  @ApiResponse({
    status: 201,
    description: 'The aid request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateAidRequestDto }) // Swagger için body tanımı
  @Post()
  async create(@Body() createAidRequestDto: CreateAidRequestDto, @Req() req) {
    const userId = req.user.id;
    return this.aidRequestsService.create(createAidRequestDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific aid request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to retrieve',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'The ID of the organization to retrieve',
  })
  async findOne(
    @Param('id') id: number,
    @Param('organizationId') organizationId: number
  ) {
    return this.aidRequestsService.findOne(id, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update aid request status and notify user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'Onaylandı' },
        deviceToken: { type: 'string', example: 'user_device_token' }, // FCM token
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated and notification sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request.',
  })
  async updateStatus(
    @Param('id') id: number,
    @Body() body: { status: string; deviceToken: string }
  ) {
    return this.aidRequestsService.updateStatus(
      id,
      body.status,
      body.deviceToken
    );
  }

  //delete methodu eklendi
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific aid request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to delete',
  })
  async delete(@Param('id') id: number) {
    return this.aidRequestsService.delete(id);
  }
}
