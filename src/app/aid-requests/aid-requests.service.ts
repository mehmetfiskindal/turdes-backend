import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AidRequest } from '@prisma/client';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';

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

    return this.prismaService.aidRequest.create({
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
        latitude: createAidRequestDto.latitude,
        longitude: createAidRequestDto.longitude,
      },
    });
  }

  async updateStatus(
    id: number,
    status: string,
    userId: number,
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
}
