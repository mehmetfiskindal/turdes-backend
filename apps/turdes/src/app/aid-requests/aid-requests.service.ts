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

  async delete(id: number) {
    return this.prismaService.aidRequest.delete({
      where: { id },
    });
  }
}
