import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('donors')
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new donation' })
  @ApiResponse({
    status: 201,
    description: 'The donation has been successfully created.',
  })
  @Post('donations')
  async createDonation(@Body() createDonationDto: CreateDonationDto) {
    return this.donorsService.createDonation(createDonationDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all donations' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all donations.',
  })
  @Get('donations')
  async findAllDonations() {
    return this.donorsService.findAllDonations();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get anonymous donations' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved anonymous donations.',
  })
  @Get('donations/anonymous')
  async findAnonymousDonations() {
    return this.donorsService.findAnonymousDonations();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donation statistics' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved donation statistics.',
  })
  @Get('donations/statistics')
  async getDonationStatistics() {
    return this.donorsService.getDonationStatistics();
  }
}
