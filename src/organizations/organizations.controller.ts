// Organizations Controller (organizations/organizations.controller.ts)
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationDto } from './dto/organization.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.organizationsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() organizationDto: OrganizationDto) {
    return this.organizationsService.create(organizationDto);
  }
}
