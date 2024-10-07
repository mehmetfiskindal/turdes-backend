import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationDto } from './dto/organization.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('organizations') // Grouping under "organizations" in Swagger documentation
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all organizations.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async getAll() {
    return this.organizationsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiBody({ type: OrganizationDto }) // Body'nin tipini Swagger'da belirtiyoruz
  async create(@Body() organizationDto: OrganizationDto) {
    return this.organizationsService.create(organizationDto);
  }
}
