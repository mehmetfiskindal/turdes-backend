import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
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

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiOperation({ summary: 'Yeni kampanya oluşturur' })
  @ApiResponse({
    status: 201,
    description: 'Kampanya başarıyla oluşturuldu.',
  })
  @ApiBody({ type: CreateCampaignDto })
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm kampanyaları listeler' })
  @ApiResponse({
    status: 200,
    description: 'Tüm kampanyalar başarıyla getirildi.',
  })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.campaignService.findAll(
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile kampanya detaylarını getirir' })
  @ApiResponse({
    status: 200,
    description: 'Kampanya detayları başarıyla getirildi.',
  })
  @ApiResponse({ status: 404, description: 'Kampanya bulunamadı.' })
  @ApiParam({ name: 'id', description: 'Kampanya ID' })
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiOperation({ summary: 'Kampanyayı günceller' })
  @ApiResponse({
    status: 200,
    description: 'Kampanya başarıyla güncellendi.',
  })
  @ApiResponse({ status: 404, description: 'Kampanya bulunamadı.' })
  @ApiParam({ name: 'id', description: 'Kampanya ID' })
  @ApiBody({ type: UpdateCampaignDto })
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Kampanyayı siler' })
  @ApiResponse({
    status: 200,
    description: 'Kampanya başarıyla silindi.',
  })
  @ApiResponse({ status: 404, description: 'Kampanya bulunamadı.' })
  @ApiParam({ name: 'id', description: 'Kampanya ID' })
  remove(@Param('id') id: string) {
    return this.campaignService.remove(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get campaign progress' })
  @ApiResponse({
    status: 200,
    description: 'Campaign progress retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found.' })
  async getCampaignProgress(@Param('id') id: string) {
    return this.campaignService.getCampaignProgress(id);
  }
}
