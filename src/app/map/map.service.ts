import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  async getAidCentersNearby(latitude: number, longitude: number, radiusKm: number) {
    // Get organizations that function as aid centers from our database
    const aidCenters = await this.prisma.organization.findMany({
      where: {
        address: {
          latitude: {
            gte: latitude - (radiusKm / 111), // Approximate conversion from km to degrees
            lte: latitude + (radiusKm / 111),
          },
          longitude: {
            gte: longitude - (radiusKm / (111 * Math.cos(latitude * Math.PI / 180))),
            lte: longitude + (radiusKm / (111 * Math.cos(latitude * Math.PI / 180))),
          },
        },
      },
      include: {
        address: true,
        contactInfo: true,
      },
    });

    // Calculate distance for each center
    const aidCentersWithDistance = aidCenters.map(center => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        center.address.latitude,
        center.address.longitude,
      );

      return {
        ...center,
        distanceKm: parseFloat(distance.toFixed(2)),
      };
    });

    // Sort by distance
    return aidCentersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async getSocialSupportServices(latitude: number, longitude: number, radiusKm: number) {
    // Use organizations as internal social support services
    const internalServices = await this.prisma.organization.findMany({
      where: {
        address: {
          latitude: {
            gte: latitude - (radiusKm / 111),
            lte: latitude + (radiusKm / 111),
          },
          longitude: {
            gte: longitude - (radiusKm / (111 * Math.cos(latitude * Math.PI / 180))),
            lte: longitude + (radiusKm / (111 * Math.cos(latitude * Math.PI / 180))),
          },
        },
        // Filter to only include social service type organizations
        type: {
          in: ['SOCIAL_SERVICE', 'HEALTHCARE', 'SHELTER', 'FOOD_BANK']
        }
      },
      include: {
        address: true,
        contactInfo: true,
      },
    });

    // Then fetch external government services
    const externalServices = await this.fetchExternalGovernmentServices(
      latitude,
      longitude,
      radiusKm,
    );

    // Combine and format results
    const internalServicesWithDistance = internalServices.map(service => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        service.address.latitude,
        service.address.longitude,
      );

      return {
        id: service.id,
        name: service.name,
        type: service.type,
        description: service.mission,
        address: service.address.address,
        contactInfo: {
          phone: service.contactInfo.phone,
          email: service.contactInfo.email,
        },
        latitude: service.address.latitude,
        longitude: service.address.longitude,
        distanceKm: parseFloat(distance.toFixed(2)),
        source: 'internal',
      };
    });

    const allServices = [...internalServicesWithDistance, ...externalServices];

    // Sort by distance
    return allServices.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async fetchExternalGovernmentServices(latitude: number, longitude: number, radiusKm: number) {
    try {
      // Mock external API call - in a real implementation, you'd replace this with an actual API call
      // For example:
      // const response = await axios.get(`https://api.government.services/find?lat=${latitude}&lon=${longitude}&radius=${radiusKm}`);
      // return response.data.services;

      // Mock data
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      // Generate some fake government services around the provided location
      const serviceTypes = ['HEALTHCARE', 'UNEMPLOYMENT', 'HOUSING', 'FOOD_ASSISTANCE', 'MENTAL_HEALTH'];
      const mockServices = [];

      for (let i = 0; i < 5; i++) {
        // Generate a random point within the radius
        const randomAngle = Math.random() * Math.PI * 2;
        const randomDistance = Math.random() * radiusKm;
        const randomLatOffset = Math.sin(randomAngle) * randomDistance / 111;
        const randomLonOffset = Math.cos(randomAngle) * randomDistance / (111 * Math.cos(latitude * Math.PI / 180));

        const serviceLat = latitude + randomLatOffset;
        const serviceLon = longitude + randomLonOffset;

        mockServices.push({
          id: `gov-${i}`,
          name: `Government ${serviceTypes[i % serviceTypes.length]} Service`,
          type: serviceTypes[i % serviceTypes.length],
          description: `Official government ${serviceTypes[i % serviceTypes.length].toLowerCase()} assistance program.`,
          address: `${Math.floor(1000 + Math.random() * 9000)} Main St.`,
          contactInfo: {
            phone: `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            email: `contact@gov-${serviceTypes[i % serviceTypes.length].toLowerCase()}.gov`,
          },
          latitude: serviceLat,
          longitude: serviceLon,
          distanceKm: parseFloat(this.calculateDistance(latitude, longitude, serviceLat, serviceLon).toFixed(2)),
          source: 'external',
          governmentAgency: `Department of ${serviceTypes[i % serviceTypes.length].replace('_', ' ')}`,
        });
      }

      return mockServices;
    } catch (error) {
      console.error('Error fetching external government services:', error);
      return [];
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
