import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class WeatherService {
  constructor(private readonly httpService: HttpService) {}

  async fetchWeatherData(latitude: number, longitude: number): Promise<any> {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`;

    try {
      const response = await this.httpService.get(url).toPromise();
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }
}
