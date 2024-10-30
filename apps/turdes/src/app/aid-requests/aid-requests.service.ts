import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  async findAll(userId: number): Promise<AidRequest[]> {
    return this.prismaService.aidRequest.findMany({
      where: { userId: userId },
    });
  }

  async findOne(id: number, userId: number) {
    const aidRequest = await this.prismaService.aidRequest.findUnique({
      where: { id },
    });

    if (!aidRequest || aidRequest.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have access to this aid request'
      );
    }

    return aidRequest;
  }
  //serviste kullanıcıya ait yardım taleplerini oluşturabilmen lazım
  // Yardım talebi oluşturma
  async create(createAidRequestDto: CreateAidRequestDto, userId: number) {
    return this.prismaService.aidRequest.create({
      data: {
        ...createAidRequestDto,
        userId: userId,
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
