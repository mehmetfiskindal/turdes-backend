import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { DonorsService } from './donors.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../casl/action';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
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

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all donations (admin access)' })
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
  @ApiOperation({ summary: 'Get current user donations' })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved user's own donations.",
  })
  @Get('donations/my')
  async findMyDonations(@Req() req) {
    return this.donorsService.findUserDonations(req.user.id);
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

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin, Role.OrganizationOwner)
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donation by ID (if owned by user or admin)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved donation.',
  })
  @ApiParam({ name: 'id', description: 'Donation ID' })
  @Get('donations/:id')
  async findDonationById(@Param('id') id: string, @Req() req) {
    return this.donorsService.findDonationById(id, req.user);
  }
}
