import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AidRequest } from '@prisma/client';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';

@Injectable()
export class AidRequestsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseAdminService: FirebaseAdminService
  ) {}

  async findAll(): Promise<AidRequest[]> {
    return this.prismaService.aidRequest.findMany();
  }

  async findOne(aidRequestId: string) {
    return this.prismaService.aidRequest.findUnique({
      where: {
        id: parseInt(aidRequestId, 10), // Convert the id to an integer
      },
    });
  }

  async create(data: CreateAidRequestDto): Promise<AidRequest> {
    return this.prismaService.aidRequest.create({
      data: {
        type: data.type,
        description: data.description,
        organization: {
          connect: { id: data.organizationId },
        },
        user: {
          connect: { id: data.userId },
        },
        // createdAt ve updatedAt otomatik olarak Prisma tarafından eklenecek
      },
    });
  }

  // Yardım talebini duruma göre güncelleme
  async updateStatus(id: number, status: string, userDeviceToken: string) {
    // Yardım talebinin durumunu güncelleme
    const updatedAidRequest = await this.prismaService.aidRequest.update({
      where: { id },
      data: { status },
    });

    // Admin durumu güncellediğinde bildirim gönder
    const message = `Yardım talebinizin durumu güncellendi: ${status}`;
    try {
      // Kullanıcının cihaz token'ına bildirim gönder
      await this.firebaseAdminService.sendPushNotification(
        userDeviceToken,
        message
      );
    } catch (error) {
      console.error(`Push notification gönderilemedi: ${error.message}`);
    }

    return updatedAidRequest;
  }
}
