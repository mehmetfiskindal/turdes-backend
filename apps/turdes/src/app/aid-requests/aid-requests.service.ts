import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AidRequest } from '@prisma/client';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';

@Injectable()
export class AidRequestsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseAdminService: FirebaseAdminService
  ) {}

  // Yorum ekleme
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
    documentUrl: string
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
  async findAll(): Promise<AidRequest[]> {
    return this.prismaService.aidRequest.findMany();
  }

  // Belirli bir yardım talebini bulma
  async findOne(aidRequestId: number, organizationId: number) {
    return this.prismaService.aidRequest.findFirst({
      where: {
        id: aidRequestId,
        organizationId: organizationId, // id'nin integer olduğuna dikkat edin
      },
    });
  }

  async create(createAidRequestDto: CreateAidRequestDto) {
    const { userId, organizationId, ...data } = createAidRequestDto;

    // Ensure the user exists
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Ensure the organization exists
    const organization = await this.prismaService.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return this.prismaService.aidRequest.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
        organization: {
          connect: { id: organizationId },
        },
      },
    });
  }

  // Yardım talebi durumunu güncelleme ve bildirim gönderme
  async updateStatus(id: number, status: string, userDeviceToken: string) {
    const updatedAidRequest = await this.prismaService.aidRequest.update({
      where: { id },
      data: { status },
    });

    const message = `Yardım talebinizin durumu güncellendi: ${status}`;
    await this.firebaseAdminService.sendPushNotification(
      userDeviceToken,
      'Yardım Talebi Güncellemesi',
      message
    );

    return updatedAidRequest;
  }

  // Yardım talebini silme
  async delete(id: number) {
    return this.prismaService.aidRequest.delete({
      where: { id },
    });
  }
}
