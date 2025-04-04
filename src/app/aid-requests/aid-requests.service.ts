import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AidRequest } from '@prisma/client';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';
import * as QRCode from 'qrcode';

@Injectable()
export class AidRequestsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async addComment(aidRequestId: number, content: string) {
    return this.prismaService.comment.create({
      data: {
        content,
        aidRequest: {
          connect: { id: aidRequestId },
        },
      },
    });
  }

  // Belge yükleme
  async uploadDocument(
    aidRequestId: number,
    documentName: string,
    documentUrl: string,
  ) {
    return this.prismaService.document.create({
      data: {
        name: documentName,
        url: documentUrl,
        aidRequest: {
          connect: { id: aidRequestId },
        },
      },
    });
  }

  // Tüm yardım taleplerini listeleme
  async findAll(userId: number): Promise<AidRequest[]> {
    return this.prismaService.aidRequest.findMany({
      where: { userId: userId, isDeleted: false },
    });
  }

  async findOne(id: number, userId: number, organizationId: number) {
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: {
        id: Number(id),
        userId: userId,
        isDeleted: false,
        organizationId: Number(organizationId),
      },
      include: {
        location: true,
      },
    });

    if (!aidRequest || aidRequest.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have access to this aid request',
      );
    }

    return aidRequest;
  }

  async create(createAidRequestDto: CreateAidRequestDto, userId: number) {
    if (createAidRequestDto.organizationId) {
      const organization = await this.prismaService.organization.findUnique({
        where: { id: createAidRequestDto.organizationId },
      });

      if (!organization) {
        throw new Error('Organization not found');
      }
    }

    const location = await this.prismaService.location.create({
      data: {
        latitude: createAidRequestDto.latitude,
        longitude: createAidRequestDto.longitude,
      },
    });

    const aidRequest = await this.prismaService.aidRequest.create({
      data: {
        type: createAidRequestDto.type,
        description: createAidRequestDto.description,
        status: createAidRequestDto.status,
        organization: createAidRequestDto.organizationId
          ? { connect: { id: createAidRequestDto.organizationId } }
          : undefined,
        location: {
          connect: { id: location.id },
        },
        user: {
          connect: { id: userId },
        },
        recurring: createAidRequestDto.recurring,
      },
    });

    const qrCodeUrl = await QRCode.toDataURL(`aidRequest:${aidRequest.id}`);
    await this.prismaService.aidRequest.update({
      where: { id: aidRequest.id },
      data: { qrCodeUrl },
    });

    return { ...aidRequest, qrCodeUrl };
  }

  async updateStatus(
    id: number,
    status: string,
    userId: string,
    userRole: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException(
        'Only admins can update the status of aid requests',
      );
    }

    const updatedAidRequest = await this.prismaService.aidRequest.update({
      where: { id: Number(id) },
      data: { status: status },
    });

    const message = `Yardım talebinizin durumu güncellendi: ${status}`;
    await this.firebaseAdminService.sendPushNotification(
      userId,
      'Aid Request Status Update',
      message,
    );

    return updatedAidRequest;
  }

  // Yardım talebi silinemez , sadece isDeleted parametresi true olur
  async delete(id: number) {
    return this.prismaService.aidRequest.update({
      where: { id: Number(id) },
      data: { isDeleted: true },
    });
  }

  // Prioritize aid requests based on user categories
  async prioritizeAidRequests() {
    const aidRequests = await this.prismaService.aidRequest.findMany({
      where: { isDeleted: false },
      include: {
        user: true,
      },
    });

    // Custom sorting logic based on user categories
    return aidRequests.sort((a, b) => {
      const categoryPriority = {
        ELDERLY: 1,
        DISABLED: 2,
        CHRONIC_ILLNESS: 3,
        NONE: 4,
      };

      return (
        categoryPriority[a.user.category] - categoryPriority[b.user.category]
      );
    });
  }

  // Calculate aid requests in a given area and highlight urgent ones
  async getUrgentAidRequestsInArea(
    latitude: number,
    longitude: number,
    radius: number,
    shouldNotify: boolean = false,
  ) {
    const aidRequests = await this.prismaService.aidRequest.findMany({
      where: {
        isDeleted: false,
        location: {
          latitude: { gte: latitude - radius, lte: latitude + radius },
          longitude: { gte: longitude - radius, lte: longitude + radius },
        },
      },
      include: {
        user: true,
        location: true,
      },
    });

    const urgentRequests = aidRequests.filter(
      (request) =>
        request.isUrgent ||
        ['ELDERLY', 'DISABLED', 'CHRONIC_ILLNESS'].includes(
          request.user.category,
        ),
    );

    // If notification is requested, find nearby users and notify them about urgent requests
    if (shouldNotify && urgentRequests.length > 0) {
      await this.notifyNearbyUsersAboutUrgentRequests(
        latitude,
        longitude,
        radius,
        urgentRequests,
      );
    }

    return {
      totalRequests: aidRequests.length,
      urgentRequests,
    };
  }

  private async notifyNearbyUsersAboutUrgentRequests(
    latitude: number,
    longitude: number,
    radius: number,
    urgentRequests: any[],
  ) {
    // Find users within the given radius
    // Here we'd usually use some sort of geospatial query
    // For simplicity, we'll assume we have a way to get users in an area
    const nearbyUsers = await this.findUsersInArea(latitude, longitude, radius);

    // For each nearby user, send notifications about urgent requests
    for (const user of nearbyUsers) {
      for (const request of urgentRequests) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          request.location.latitude,
          request.location.longitude,
        );

        const message = `Urgent aid needed ${distance.toFixed(1)}km away: ${request.description}`;

        await this.firebaseAdminService.sendPushNotification(
          user.id.toString(),
          'Urgent Aid Needed Nearby',
          message,
        );
      }
    }
  }

  private async findUsersInArea(
    latitude: number,
    longitude: number,
    radius: number,
  ) {
    // This is a simplified implementation
    // In a real application, you would need a more sophisticated geospatial query
    const users = await this.prismaService.user.findMany({
      where: {
        // In a real application, you'd use geospatial queries from your database
        // For now, we'll just return all users with role = "volunteer"
        role: 'volunteer',
      },
    });

    return users;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async trackRecurringAidRequests() {
    const recurringAidRequests = await this.prismaService.aidRequest.findMany({
      where: { recurring: true, isDeleted: false },
    });

    for (const aidRequest of recurringAidRequests) {
      const message = `Scheduled support needed for recurring aid request: ${aidRequest.description}`;
      await this.firebaseAdminService.sendPushNotification(
        aidRequest.userId.toString(),
        'Scheduled Support Notification',
        message,
      );
    }
  }

  async verifyAidRequest(aidRequestId: number) {
    return this.prismaService.aidRequest.update({
      where: { id: aidRequestId },
      data: { verified: true },
    });
  }

  async reportSuspiciousAidRequest(aidRequestId: number) {
    return this.prismaService.aidRequest.update({
      where: { id: aidRequestId },
      data: { reported: true },
    });
  }

  async verifyAidDeliveryByQRCode(
    qrCodeData: string,
    newStatus: string = 'Delivered',
  ) {
    // Extract aid request ID from QR code data
    const aidRequestId = parseInt(qrCodeData.replace('aidRequest:', ''));

    if (isNaN(aidRequestId)) {
      throw new Error('Invalid QR code data');
    }

    // Verify aid request exists
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id: aidRequestId },
      include: { user: true },
    });

    if (!aidRequest) {
      throw new Error('Aid request not found');
    }

    // Update the aid request status
    const updatedAidRequest = await this.prismaService.aidRequest.update({
      where: { id: aidRequestId },
      data: { status: newStatus },
    });

    // Send notification to the user
    const message = `Your aid request (ID: ${aidRequestId}) has been ${newStatus.toLowerCase()}`;
    await this.firebaseAdminService.sendPushNotification(
      aidRequest.userId.toString(),
      'Aid Delivery Update',
      message,
    );

    return updatedAidRequest;
  }

  async triggerAidRequestsBasedOnWeather(latitude: number, longitude: number) {
    // Fetch weather data from an external API
    const weatherData = await this.fetchWeatherData(latitude, longitude);

    if (weatherData.isExtreme) {
      // Create a location for the aid request
      const location = await this.prismaService.location.create({
        data: {
          latitude,
          longitude,
        },
      });

      // Find users in the affected area
      const usersInArea = await this.findUsersInArea(latitude, longitude, 10); // 10km radius

      // Create system-generated aid requests for each user in the area with vulnerable categories
      const vulnerableUsers = usersInArea.filter((user) =>
        ['ELDERLY', 'DISABLED', 'CHRONIC_ILLNESS'].includes(user.category),
      );

      const createdRequests = [];

      for (const user of vulnerableUsers) {
        const aidRequest = await this.prismaService.aidRequest.create({
          data: {
            type: 'Weather-related',
            description: `${weatherData.alertType}: ${weatherData.description}. Automated request for vulnerable user.`,
            status: 'Pending',
            isUrgent: true,
            location: {
              connect: { id: location.id },
            },
            user: {
              connect: { id: user.id },
            },
          },
        });

        const qrCodeUrl = await QRCode.toDataURL(`aidRequest:${aidRequest.id}`);
        await this.prismaService.aidRequest.update({
          where: { id: aidRequest.id },
          data: { qrCodeUrl },
        });

        await this.firebaseAdminService.sendPushNotification(
          user.id.toString(),
          'Weather Alert: Aid Request Created',
          `Due to extreme weather (${weatherData.alertType}), an urgent aid request has been automatically created for you.`,
        );

        createdRequests.push({ ...aidRequest, qrCodeUrl });
      }

      // Create a single notification for administrators and relief organizations
      await this.notifyOrganizationsOfWeatherEmergency(weatherData, location);

      return {
        weatherAlert: weatherData,
        affectedUserCount: vulnerableUsers.length,
        createdRequests,
      };
    }

    return {
      weatherAlert: weatherData,
      affectedUserCount: 0,
      createdRequests: [],
    };
  }

  private async fetchWeatherData(latitude: number, longitude: number) {
    try {
      // In a real implementation, you would call an external weather API
      // For example, OpenWeatherMap, WeatherAPI, or a national weather service API

      // This is a mock implementation for demonstration purposes
      // In a real application, replace this with actual API calls

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Randomly determine if there's an extreme weather condition (for demonstration)
      const isExtreme = Math.random() > 0.7;

      if (isExtreme) {
        const possibleAlerts = [
          {
            alertType: 'Severe Storm Warning',
            description:
              'Heavy rainfall and strong winds expected. Potential for flooding and property damage.',
            severity: 'high',
          },
          {
            alertType: 'Extreme Heat Warning',
            description:
              'Dangerous heat conditions with temperatures exceeding 40°C. Increased risk for heat-related illnesses.',
            severity: 'high',
          },
          {
            alertType: 'Earthquake Aftershock Alert',
            description:
              'Multiple aftershocks expected following the recent seismic activity.',
            severity: 'high',
          },
          {
            alertType: 'Flood Warning',
            description:
              'Rising water levels in nearby rivers. Potential for residential flooding.',
            severity: 'medium',
          },
        ];

        const selectedAlert =
          possibleAlerts[Math.floor(Math.random() * possibleAlerts.length)];

        return {
          isExtreme,
          ...selectedAlert,
          timestamp: new Date().toISOString(),
          coordinates: { latitude, longitude },
        };
      }

      return {
        isExtreme,
        alertType: 'Normal',
        description: 'No extreme weather conditions detected.',
        severity: 'low',
        timestamp: new Date().toISOString(),
        coordinates: { latitude, longitude },
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return default non-extreme weather in case of API errors
      return {
        isExtreme: false,
        alertType: 'Unknown',
        description: 'Could not fetch weather data.',
        severity: 'unknown',
        timestamp: new Date().toISOString(),
        coordinates: { latitude, longitude },
        error: error.message,
      };
    }
  }

  private async notifyOrganizationsOfWeatherEmergency(
    weatherData: any,
    location: any,
  ) {
    // Find organizations that can help with emergency responses
    const emergencyOrganizations =
      await this.prismaService.organization.findMany({
        where: {
          type: {
            in: ['EMERGENCY', 'DISASTER_RELIEF', 'MEDICAL', 'SHELTER'],
          },
        },
        include: {
          contactInfo: true,
        },
      });

    // Create a notification for admin users
    await this.prismaService.notification.create({
      data: {
        content: `WEATHER ALERT: ${weatherData.alertType} at coordinates (${location.latitude}, ${location.longitude}). ${emergencyOrganizations.length} relief organizations have been notified.`,
        userId: 1, // Assuming user ID 1 is an admin, replace with appropriate admin user ID
      },
    });

    // In a real implementation, you would notify the organizations
    // This could involve emails, SMS, push notifications, etc.
    return emergencyOrganizations;
  }

  async searchAidRequests(filters: any) {
    const {
      type,
      status,
      latitude,
      longitude,
      radiusKm = 10,
      urgentOnly = false,
      userCategory,
      recurring,
      verifiedOnly,
      searchTerm,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    // Build the where clause based on filters
    const where: any = {
      isDeleted: false,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (urgentOnly) {
      where.isUrgent = true;
    }

    if (recurring !== undefined) {
      where.recurring = recurring;
    }

    if (verifiedOnly) {
      where.verified = true;
    }

    if (searchTerm) {
      where.description = {
        contains: searchTerm,
        mode: 'insensitive', // Case insensitive search
      };
    }

    if (dateFrom) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(dateFrom),
      };
    }

    if (dateTo) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(dateTo),
      };
    }

    // Handle geographic search if coordinates are provided
    let locationFilter = {};
    if (latitude && longitude) {
      locationFilter = {
        location: {
          latitude: {
            gte: parseFloat(latitude as any) - radiusKm / 111,
            lte: parseFloat(latitude as any) + radiusKm / 111,
          },
          longitude: {
            gte:
              parseFloat(longitude as any) -
              radiusKm /
                (111 * Math.cos((parseFloat(latitude as any) * Math.PI) / 180)),
            lte:
              parseFloat(longitude as any) +
              radiusKm /
                (111 * Math.cos((parseFloat(latitude as any) * Math.PI) / 180)),
          },
        },
      };
    }

    // User category filter
    let userFilter = {};
    if (userCategory) {
      userFilter = {
        user: {
          category: userCategory,
        },
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute the query
    const [aidRequests, total] = await Promise.all([
      this.prismaService.aidRequest.findMany({
        where: {
          ...where,
          ...locationFilter,
          ...userFilter,
        },
        include: {
          user: true,
          location: true,
          organization: true,
        },
        orderBy: {
          [sortBy]: sortDirection,
        },
        skip,
        take: limit,
      }),
      this.prismaService.aidRequest.count({
        where: {
          ...where,
          ...locationFilter,
          ...userFilter,
        },
      }),
    ]);

    // Add distance calculation if coordinates were provided
    let aidRequestsWithMeta = aidRequests;
    if (latitude && longitude) {
      aidRequestsWithMeta = aidRequests.map((request) => {
        const distance = this.calculateDistance(
          parseFloat(latitude as any),
          parseFloat(longitude as any),
          request.location.latitude,
          request.location.longitude,
        );

        // Create a properly typed object with all required properties preserved
        return {
          ...request,
          distanceKm: parseFloat(distance.toFixed(2)),
        };
      }) as typeof aidRequests;
    }

    // If sorting by distance was requested
    if (sortBy === 'distance') {
      aidRequestsWithMeta.sort((a, b) => {
        // Use a more type-safe way to access the distanceKm property
        const aDistance = 'distanceKm' in a ? (a as any).distanceKm : 0;
        const bDistance = 'distanceKm' in b ? (b as any).distanceKm : 0;
        return sortDirection === 'asc'
          ? aDistance - bDistance
          : bDistance - aDistance;
      });
    }

    return {
      data: aidRequestsWithMeta,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
