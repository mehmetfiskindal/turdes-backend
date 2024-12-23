import { Controller, Get, Param } from '@nestjs/common';
import { MapService } from './map.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @ApiOperation({ summary: 'Get aid requests for a specific location' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved aid requests for the location.',
  })
  @ApiResponse({ status: 404, description: 'No aid requests found for the location' })
  @ApiParam({
    name: 'latitude',
    description: 'The latitude of the location',
  })
  @ApiParam({
    name: 'longitude',
    description: 'The longitude of the location',
  })
  @Get(':latitude/:longitude')
  async getAidRequests(
    @Param('latitude') latitude: number,
    @Param('longitude') longitude: number
  ) {
    return this.mapService.getAidRequests(latitude, longitude);
  }
}
