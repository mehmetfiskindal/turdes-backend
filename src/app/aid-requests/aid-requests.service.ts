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
    console.log('Generated QR Code URL length:', qrCodeUrl.length);
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
