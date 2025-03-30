import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MapService } from './map.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find aid centers near a location' })
  @ApiResponse({
    status: 200,
    description: 'Successfully found aid centers near the specified location.',
  })
  @ApiQuery({ name: 'latitude', description: 'Latitude of the center point', type: 'number' })
  @ApiQuery({ name: 'longitude', description: 'Longitude of the center point', type: 'number' })
  @ApiQuery({ name: 'radiusKm', description: 'Search radius in kilometers', type: 'number' })
  @Get('aid-centers')
  async getAidCentersNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusKm') radiusKm = 10, // Default 10km radius
  ) {
    return this.mapService.getAidCentersNearby(
      parseFloat(latitude as any),
      parseFloat(longitude as any),
      parseFloat(radiusKm as any),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find social support services near a location' })
  @ApiResponse({
    status: 200,
    description: 'Successfully found social support services near the specified location.',
  })
  @ApiQuery({ name: 'latitude', description: 'Latitude of the center point', type: 'number' })
  @ApiQuery({ name: 'longitude', description: 'Longitude of the center point', type: 'number' })
  @ApiQuery({ name: 'radiusKm', description: 'Search radius in kilometers', type: 'number' })
  @Get('social-services')
  async getSocialSupportServices(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusKm') radiusKm = 15, // Default 15km radius
  ) {
    return this.mapService.getSocialSupportServices(
      parseFloat(latitude as any),
      parseFloat(longitude as any),
      parseFloat(radiusKm as any),
    );
  }
}
