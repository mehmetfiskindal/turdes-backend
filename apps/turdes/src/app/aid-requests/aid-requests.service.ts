import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AidRequest } from '@prisma/client';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';

@Injectable()
export class AidRequestsService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
