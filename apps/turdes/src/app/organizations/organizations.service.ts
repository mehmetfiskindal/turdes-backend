import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  create(createOrganizationDto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: createOrganizationDto,
    });
  }

  findAll() {
    return this.prisma.organization.findMany();
  }

  findOne(id: number) {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });
  }

  remove(id: number) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }
}
