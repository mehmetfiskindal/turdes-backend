import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class AidCentersService {
  constructor(private readonly httpService: HttpService) {}

  async fetchLocalAidCenters(): Promise<any> {
    // Placeholder for actual API integration to fetch local aid centers
    return [
      {
        id: 1,
        name: 'Local Aid Center 1',
        address: '123 Main St, City, Country',
        services: ['Food', 'Shelter', 'Medical'],
      },
      {
        id: 2,
        name: 'Local Aid Center 2',
        address: '456 Elm St, City, Country',
        services: ['Clothing', 'Counseling'],
      },
    ];
  }

  async fetchGovernmentAidServices(): Promise<any> {
    const apiKey = process.env.GOVERNMENT_AID_API_KEY;
    const url = `https://api.governmentaidservices.com/v1/services?key=${apiKey}`;

    try {
      const response = await this.httpService.get(url).toPromise();
      return response.data;
    } catch (error) {
      console.error('Error fetching government aid services:', error);
      throw new Error('Failed to fetch government aid services');
    }
  }
}
