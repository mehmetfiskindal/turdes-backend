import { Controller, Get, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @ApiOperation({ summary: 'Fetch weather data for a specific location' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved weather data for the location.',
  })
  @ApiResponse({ status: 404, description: 'No weather data found for the location' })
  @ApiParam({
    name: 'latitude',
    description: 'The latitude of the location',
  })
  @ApiParam({
    name: 'longitude',
    description: 'The longitude of the location',
  })
  @Get(':latitude/:longitude')
  async getWeatherData(
    @Param('latitude') latitude: number,
    @Param('longitude') longitude: number
  ) {
    return this.weatherService.fetchWeatherData(latitude, longitude);
  }
}
