// Aid Requests Controller (aid-requests/aid-requests.controller.ts)
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AidRequestsService } from './aid-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AidRequestDto } from './dto/aid-request.dto';

@Controller('aidrequests')
export class AidRequestsController {
  constructor(private readonly aidRequestsService: AidRequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.aidRequestsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() aidRequestDto: AidRequestDto) {
    return this.aidRequestsService.create(aidRequestDto);
  }
}
