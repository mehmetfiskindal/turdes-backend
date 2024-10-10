import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Prisma servisi eklendi
import { OrganizationDto } from './dto/organization.dto';
import { Organization } from '@prisma/client'; // Prisma Organization modelini kullanıyoruz

@Injectable()
export class OrganizationsService {
  constructor(private readonly prismaService: PrismaService) {}

  // Tüm organizasyonları getir
  async findAll(): Promise<Organization[]> {
    return this.prismaService.organization.findMany();
  }

  // Yeni organizasyon oluştur
  async create(organizationDto: OrganizationDto): Promise<Organization> {
    return this.prismaService.organization.create({
      data: {
        name: organizationDto.name,
        address: organizationDto.address || null, // Opsiyonel alanları null yapalım
        contactInfo: organizationDto.contactInfo || null,
        // `createdAt` ve `updatedAt` Prisma tarafından otomatik doldurulacak
      },
    });
  }
}
