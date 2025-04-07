import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRequestHistory(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { aidRequests: true },
    });

    if (!user) {
      throw new NotFoundException(`${userId} ID'li kullanıcı bulunamadı`);
    }

    return user.aidRequests;
  }

  async getOrganizationRequestHistory(organizationId: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { aidRequest: true },
    });

    if (!organization) {
      throw new NotFoundException(
        `${organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    return organization.aidRequest;
  }
}
