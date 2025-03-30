import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrganizationService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('organizations') // Grouping under "organizations" in Swagger documentation
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all organizations.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async findAll() {
    return this.organizationsService.findAll();
  }

  //findOne
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.organizationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiBody({ type: CreateOrganizationDto }) // Body'nin tipini Swagger'da belirtiyoruz
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() organizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(organizationDto);
  }

  @ApiOperation({ summary: 'Update an organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiBody({ type: UpdateOrganizationDto }) // Body'nin tipini Swagger'da belirtiyoruz
  @ApiParam({ name: 'id', type: 'number' }) // Parametre'nin tipini Swagger'da belirtiyoruz
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Body() organizationDto: UpdateOrganizationDto,
    @Param('id') id: number
  ) {
    return this.organizationsService.update(id, organizationDto);
  }

  @ApiOperation({ summary: 'Send a message to an organization' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiBody({ type: CreateMessageDto }) // Body'nin tipini Swagger'da belirtiyoruz
  @ApiParam({ name: 'id', type: 'number' }) // Parametre'nin tipini Swagger'da belirtiyoruz
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/messages')
  async sendMessage(
    @Body() messageDto: CreateMessageDto,
    @Param('id') id: number
  ) {
    return this.organizationsService.sendMessage(id, messageDto);
  }

  @ApiOperation({ summary: 'Add rating and feedback to an organization' })
  @ApiResponse({
    status: 200,
    description: 'Rating and feedback added successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: {
          type: 'number',
          description: 'The rating of the organization',
        },
        feedback: {
          type: 'string',
          description: 'The feedback for the organization',
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'number' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/rating-feedback')
  async addRatingAndFeedback(
    @Param('id') id: number,
    @Body('rating') rating: number,
    @Body('feedback') feedback: string,
  ) {
    return this.organizationsService.addRatingAndFeedback(id, rating, feedback);
  }

  @ApiOperation({ summary: 'Flag and report a suspicious or ineffective organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization flagged and reported successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'The reason for flagging the organization',
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'number' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/flag')
  async flagOrganization(
    @Param('id') id: number,
    @Body('reason') reason: string,
  ) {
    return this.organizationsService.flagOrganization(id, reason);
  }
}
