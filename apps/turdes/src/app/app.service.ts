import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}
  async getOrganizationNames(): Promise<string[]> {
    const organizations = await this.prismaService.organization.findMany();
    return organizations.map((organization) => organization.name);
  }
}
