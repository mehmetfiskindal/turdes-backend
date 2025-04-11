import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DonationService } from './donation.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../casl/action';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('donations')
@Controller('donations')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Post()
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiOperation({ summary: 'Yeni bağış kaydı oluşturur' })
  @ApiResponse({
    status: 201,
    description: 'Bağış başarıyla kaydedildi.',
  })
  @ApiBody({ type: CreateDonationDto })
  recordDonation(@Body() createDonationDto: CreateDonationDto) {
    return this.donationService.recordDonation(createDonationDto);
  }

  @Get()
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiOperation({ summary: 'Tüm bağışları listeler' })
  @ApiResponse({
    status: 200,
    description: 'Tüm bağışlar başarıyla getirildi.',
  })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.donationService.findAll(
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
    );
  }

  @Get(':id')
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiOperation({ summary: 'ID ile bağış detaylarını getirir' })
  @ApiResponse({
    status: 200,
    description: 'Bağış detayları başarıyla getirildi.',
  })
  @ApiResponse({ status: 404, description: 'Bağış bulunamadı.' })
  @ApiParam({ name: 'id', description: 'Bağış ID' })
  findOne(@Param('id') id: string) {
    return this.donationService.findById(id);
  }

  @Get('campaign/:campaignId')
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiOperation({ summary: "Kampanya ID'sine göre bağışları getirir" })
  @ApiResponse({
    status: 200,
    description: 'Kampanyaya ait bağışlar başarıyla getirildi.',
  })
  @ApiResponse({ status: 404, description: 'Kampanya bulunamadı.' })
  @ApiParam({ name: 'campaignId', description: 'Kampanya ID' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findByCampaignId(
    @Param('campaignId') campaignId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.donationService.findByCampaignId(
      campaignId,
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
    );
  }

  @Get('donor/:donorId')
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiOperation({ summary: "Bağışçı ID'sine göre bağışları getirir" })
  @ApiResponse({
    status: 200,
    description: 'Bağışçıya ait bağışlar başarıyla getirildi.',
  })
  @ApiResponse({ status: 404, description: 'Bağışçı bulunamadı.' })
  @ApiParam({ name: 'donorId', description: 'Bağışçı ID (Stakeholder)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findByDonorId(
    @Param('donorId') donorId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.donationService.findByDonorId(
      donorId,
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
    );
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Bağış kaydını günceller' })
  @ApiResponse({
    status: 200,
    description: 'Bağış başarıyla güncellendi.',
  })
  @ApiResponse({ status: 404, description: 'Bağış bulunamadı.' })
  @ApiParam({ name: 'id', description: 'Bağış ID' })
  @ApiBody({ type: UpdateDonationDto })
  update(
    @Param('id') id: string,
    @Body() updateDonationDto: UpdateDonationDto,
  ) {
    return this.donationService.update(id, updateDonationDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Bağış kaydını siler' })
  @ApiResponse({
    status: 200,
    description: 'Bağış başarıyla silindi.',
  })
  @ApiResponse({ status: 404, description: 'Bağış bulunamadı.' })
  @ApiParam({ name: 'id', description: 'Bağış ID' })
  remove(@Param('id') id: string) {
    return this.donationService.remove(id);
  }
}
