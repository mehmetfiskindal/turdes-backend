import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
@Injectable()
export class AppService {
  constructor(private readonly prisma?: PrismaService) {}

  async getOrganizationNames(): Promise<string[]> {
    if (!this.prisma) return [];
    const orgs = await this.prisma.organization.findMany({
      select: { name: true },
    });
    return orgs.map((o) => o.name);
  }
}
