import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AidRequest } from '@prisma/client';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';
import * as QRCode from 'qrcode';
import { nanoid } from 'nanoid';

@Injectable()
export class AidRequestsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async addComment(aidRequestId: number, content: string) {
    // AidRequest'in varlığını kontrol et
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id: aidRequestId },
    });

    if (!aidRequest) {
      throw new NotFoundException(
        `${aidRequestId} ID'li yardım talebi bulunamadı`,
      );
    }

    if (!content || content.trim() === '') {
      throw new BadRequestException('Yorum içeriği boş olamaz');
    }

    return this.prismaService.comment.create({
      data: {
        content: content,
        aidRequest: {
          connect: {
            id: aidRequestId,
          },
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
    const numericId = parseInt(aidRequestId as unknown as string, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Geçersiz yardım talebi ID formatı');
    }

    // AidRequest'in varlığını kontrol et
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id: numericId },
    });

    if (!aidRequest) {
      throw new NotFoundException(
        `${numericId} ID'li yardım talebi bulunamadı`,
      );
    }

    return this.prismaService.document.create({
      data: {
        name: documentName,
        url: documentUrl,
        aidRequest: {
          connect: { id: numericId },
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
        throw new NotFoundException(
          `Organizasyon bulunamadı. ID: ${createAidRequestDto.organizationId}`,
        );
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

  // Benzersiz yardım kodu ile yardım talebi oluşturma
  async createWithHelpCode(
    createAidRequestDto: CreateAidRequestDto,
    userId: number,
  ) {
    if (createAidRequestDto.organizationId) {
      const organization = await this.prismaService.organization.findUnique({
        where: { id: createAidRequestDto.organizationId },
      });

      if (!organization) {
        throw new NotFoundException(
          `Organizasyon bulunamadı. ID: ${createAidRequestDto.organizationId}`,
        );
      }
    }

    // Benzersiz bir yardım kodu oluştur (10 karakter uzunluğunda)
    const helpCode = nanoid(10);

    const aidRequest = await this.prismaService.aidRequest.create({
      data: {
        type: createAidRequestDto.type,
        description: createAidRequestDto.description,
        status: createAidRequestDto.status || 'pending',
        organization: createAidRequestDto.organizationId
          ? { connect: { id: createAidRequestDto.organizationId } }
          : undefined,
        user: {
          connect: { id: userId },
        },
        location: {
          create: {
            latitude: createAidRequestDto.latitude,
            longitude: createAidRequestDto.longitude,
          },
        },
        recurring: createAidRequestDto.recurring || false,
        isUrgent: createAidRequestDto.isUrgent || false,
        helpCode: helpCode, // Benzersiz yardım kodunu ayrı bir alanda saklıyoruz
      },
    });

    return {
      ...aidRequest,
      helpCode, // Yanıtta yardım kodunu döndür
    };
  }

  // Yardım kodunu kullanarak mevcut bir yardım talebine konum bilgisi ekleme
  async addLocationToAidRequest(
    helpCode: string,
    latitude: number,
    longitude: number,
  ) {
    // HelpCode alanında yardım kodunu ara
    const aidRequest = await this.prismaService.aidRequest.findFirst({
      where: {
        helpCode: helpCode,
      },
    });

    if (!aidRequest) {
      throw new NotFoundException(
        `Geçerli bir yardım kodu bulunamadı: ${helpCode}`,
      );
    }

    // Konum oluştur
    const location = await this.prismaService.location.create({
      data: {
        latitude,
        longitude,
      },
    });

    // Yardım talebini güncelle ve konumu bağla
    const updatedRequest = await this.prismaService.aidRequest.update({
      where: { id: aidRequest.id },
      data: {
        locationId: location.id,
        // Gerçek QR kod oluştur
        qrCodeUrl: await QRCode.toDataURL(`aidRequest:${aidRequest.id}`),
      },
      include: {
        location: true,
        user: true,
        organization: true,
      },
    });

    return updatedRequest;
  }

  async updateStatus(
    id: number,
    status: string,
    userId: string,
    userRole: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException(
        'Yardım taleplerinin durumunu sadece yöneticiler güncelleyebilir',
      );
    }

    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!aidRequest) {
      throw new NotFoundException(`${id} ID'li yardım talebi bulunamadı`);
    }

    if (aidRequest.status === status) {
      throw new BadRequestException(
        `Yardım talebi zaten ${status} durumunda bulunuyor`,
      );
    }

    const updatedAidRequest = await this.prismaService.aidRequest.update({
      where: { id: Number(id) },
      data: { status: status },
    });

    const message = `Yardım talebinizin durumu güncellendi: ${status}`;
    await this.firebaseAdminService.sendPushNotification(
      userId,
      'Yardım Talebi Durum Güncellemesi',
      message,
    );

    return updatedAidRequest;
  }

  // Yardım talebi silinemez , sadece isDeleted parametresi true olur
  async delete(id: number) {
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!aidRequest) {
      throw new NotFoundException(`${id} ID'li yardım talebi bulunamadı`);
    }

    if (aidRequest.isDeleted) {
      throw new BadRequestException(
        `${id} ID'li yardım talebi zaten silinmiş durumda`,
      );
    }

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
    const dLon = this.deg2rad(lon1 - lon2);
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
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id: aidRequestId },
    });

    if (!aidRequest) {
      throw new NotFoundException(
        `${aidRequestId} ID'li yardım talebi bulunamadı`,
      );
    }

    if (aidRequest.verified) {
      throw new BadRequestException(
        `${aidRequestId} ID'li yardım talebi zaten onaylanmış durumda`,
      );
    }

    return this.prismaService.aidRequest.update({
      where: { id: aidRequestId },
      data: { verified: true },
    });
  }

  async reportSuspiciousAidRequest(aidRequestId: number) {
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id: aidRequestId },
    });

    if (!aidRequest) {
      throw new NotFoundException(
        `${aidRequestId} ID'li yardım talebi bulunamadı`,
      );
    }

    if (aidRequest.reported) {
      throw new BadRequestException(
        `${aidRequestId} ID'li yardım talebi zaten şüpheli olarak raporlanmış durumda`,
      );
    }

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
      throw new BadRequestException(
        'Geçersiz QR kod verisi. Doğru format: aidRequest:[ID]',
      );
    }

    // Verify aid request exists
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id: aidRequestId },
      include: { user: true },
    });

    if (!aidRequest) {
      throw new NotFoundException(
        `${aidRequestId} ID'li yardım talebi bulunamadı`,
      );
    }

    // Update the aid request status
    const updatedAidRequest = await this.prismaService.aidRequest.update({
      where: { id: aidRequestId },
      data: { status: newStatus },
    });

    // Send notification to the user
    const message = `Yardım talebiniz (ID: ${aidRequestId}) durumu: ${newStatus.toLowerCase()}`;
    await this.firebaseAdminService.sendPushNotification(
      aidRequest.userId.toString(),
      'Yardım Teslim Güncelleme',
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
