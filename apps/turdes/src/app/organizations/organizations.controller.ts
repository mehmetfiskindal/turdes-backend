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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiBody({ type: CreateOrganizationDto }) // Body'nin tipini Swagger'da belirtiyoruz
  @Post()
  async create(@Body() organizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(organizationDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiBody({ type: UpdateOrganizationDto }) // Body'nin tipini Swagger'da belirtiyoruz
  @ApiParam({ name: 'id', type: 'number' }) // Parametre'nin tipini Swagger'da belirtiyoruz
  async update(
    @Body() organizationDto: UpdateOrganizationDto,
    @Param('id') id: number
  ) {
    return this.organizationsService.update(id, organizationDto);
  }
}
