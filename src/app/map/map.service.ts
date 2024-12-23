import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAidRequests(latitude: number, longitude: number) {
    const aidRequests = await this.prismaService.aidRequest.findMany({
      where: {
        isDeleted: false,
      },
    });

    if (aidRequests.length === 0) {
      throw new NotFoundException('No aid requests found for the location');
    }

    return aidRequests;
  }
}
