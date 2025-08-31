import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AidRequest } from '@prisma/client';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { UpdateAidRequestDto } from './dto/update-aid-request.dto';
import { BaseService, PaginatedResult } from '../../common';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AidRequestsService extends BaseService<
  AidRequest,
  CreateAidRequestDto,
  UpdateAidRequestDto
> {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  // BaseService metodlarını override ediyoruz
  async create(data: CreateAidRequestDto): Promise<AidRequest> {
    const helpCode = uuidv4().slice(0, 8).toUpperCase();

    const aidRequest = await this.prisma.aidRequest.create({
      data: {
        ...data,
        helpCode,
      },
      include: {
        user: true,
        organization: true,
        location: true,
      },
    });

    // QR kod oluştur
    if (aidRequest.id) {
      await this.generateQRCode(aidRequest.id);
    }

    return aidRequest;
  }

  async findAll(): Promise<AidRequest[]> {
    return this.prisma.aidRequest.findMany({
      where: { isDeleted: false },
      include: {
        user: true,
        organization: true,
        location: true,
        Comment: true,
        Document: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number): Promise<AidRequest | null> {
    const aidRequest = await this.prisma.aidRequest.findUnique({
      where: { id, isDeleted: false },
      include: {
        user: true,
        organization: true,
        location: true,
        Comment: true,
        Document: true,
      },
    });

    if (!aidRequest) {
      throw new NotFoundException(`${id} ID'li yardım talebi bulunamadı`);
    }

    return aidRequest;
  }

  async update(id: number, data: UpdateAidRequestDto): Promise<AidRequest> {
    await this.findOne(id); // Varlık kontrolü

    return this.prisma.aidRequest.update({
      where: { id },
      data,
      include: {
        user: true,
        organization: true,
        location: true,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id); // Varlık kontrolü

    await this.prisma.aidRequest.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // Sayfalanmış yardım talepleri getir
  async getPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    userId?: number,
  ): Promise<PaginatedResult<AidRequest>> {
    const {
      skip,
      take,
      where: searchWhere,
    } = this.createPaginationQuery(page, limit, search, [
      'type',
      'description',
      'helpCode',
    ]);

    const where = {
      ...searchWhere,
      isDeleted: false,
      ...(userId && { userId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.aidRequest.findMany({
        where,
        skip,
        take,
        include: {
          user: true,
          organization: true,
          location: true,
        },
        orderBy: { id: 'desc' },
      }),
      this.prisma.aidRequest.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private async generateQRCode(aidRequestId: number): Promise<void> {
    try {
      const qrData = `aid-request:${aidRequestId}`;
      const qrCodeUrl = await QRCode.toDataURL(qrData);

      await this.prisma.aidRequest.update({
        where: { id: aidRequestId },
        data: { qrCodeUrl },
      });
    } catch (error) {
      // QR kod oluşturma hatası kritik değil, sadece log
      console.error('QR kod oluşturma hatası:', error);
    }
  }

  // Kullanıcıya özel yardım talepleri
  async findAllByUser(userId: number): Promise<AidRequest[]> {
    return this.prisma.aidRequest.findMany({
      where: { userId, isDeleted: false },
      include: {
        user: true,
        organization: true,
        location: true,
        Comment: true,
        Document: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  // Yardım koduna göre bul
  async findByHelpCode(helpCode: string): Promise<AidRequest | null> {
    return this.prisma.aidRequest.findFirst({
      where: { helpCode, isDeleted: false },
      include: {
        user: true,
        organization: true,
        location: true,
        Comment: true,
        Document: true,
      },
    });
  }

  // Yorum ekleme
  async addComment(aidRequestId: number, content: string) {
    const aidRequest = await this.prisma.aidRequest.findUnique({
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

    return this.prisma.comment.create({
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
  async uploadDocument(aidRequestId: number, name: string, url: string) {
    const aidRequest = await this.prisma.aidRequest.findUnique({
      where: { id: aidRequestId },
    });

    if (!aidRequest) {
      throw new NotFoundException(
        `${aidRequestId} ID'li yardım talebi bulunamadı`,
      );
    }

    return this.prisma.document.create({
      data: {
        name,
        url,
        aidRequestId,
      },
    });
  }

  // Tekrarlayan talep olarak işaretle
  async markAsRecurring(id: number): Promise<AidRequest> {
    return this.update(id, { recurring: true });
  }

  // Tekrarlayan talep işaretini kaldır
  async unmarkAsRecurring(id: number): Promise<AidRequest> {
    return this.update(id, { recurring: false });
  }

  // Kullanıcının tekrarlayan taleplerini getir
  async getUserRecurringRequests(userId: number): Promise<AidRequest[]> {
    return this.prisma.aidRequest.findMany({
      where: {
        userId,
        recurring: true,
        isDeleted: false,
      },
      include: {
        user: true,
        organization: true,
        location: true,
        Comment: true,
        Document: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  // Tüm tekrarlayan talepleri getir (admin için)
  async getAllRecurringRequests(): Promise<AidRequest[]> {
    return this.prisma.aidRequest.findMany({
      where: {
        recurring: true,
        isDeleted: false,
      },
      include: {
        user: true,
        organization: true,
        location: true,
        Comment: true,
        Document: true,
      },
      orderBy: { id: 'desc' },
    });
  }
}
