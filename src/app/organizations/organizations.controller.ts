import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  SetMetadata,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Role } from '../casl/action';

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
import { OrganizationRatingDto } from './dto/organization-rating.dto';

// Roles için bir decorator oluşturuyorum
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
  })
  @ApiBody({ type: CreateOrganizationDto }) // Body'nin tipini Swagger'da belirtiyoruz
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin, Role.OrganizationOwner)
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
    @Param('id') id: number,
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
    @Param('id', ParseIntPipe) id: number,
  ) {
    // URL'deki id parametresini messageDto'ya atıyoruz
    messageDto.organizationId = id;
    return this.organizationsService.sendMessage(messageDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate an organization and provide feedback' })
  @ApiResponse({
    status: 200,
    description: 'Successfully rated the organization.',
  })
  @Post(':id/ratings')
  async rateOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body() organizationRatingDto: OrganizationRatingDto,
  ) {
    return this.organizationsService.rateOrganization(
      id,
      organizationRatingDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ratings for an organization' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved organization ratings.',
  })
  @Get(':id/ratings')
  async getOrganizationRatings(@Param('id', ParseIntPipe) id: number) {
    return this.organizationsService.getOrganizationRatings(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Flag an organization for review' })
  @ApiResponse({
    status: 200,
    description: 'Successfully flagged the organization for review.',
  })
  @Post(':id/flag')
  async flagOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    return this.organizationsService.flagOrganization(id, reason);
  }
}
