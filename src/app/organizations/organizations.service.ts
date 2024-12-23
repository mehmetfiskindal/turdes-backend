import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const contactInfo = await this.prisma.contactInfo.create({
      data: {
        phone: createOrganizationDto.phone,
        email: createOrganizationDto.email,
        contactName: createOrganizationDto.contactName,
        contactPhone: createOrganizationDto.contactPhone,
        contactEmail: createOrganizationDto.contactEmail,
      },
    });

    const address = await this.prisma.address.create({
      data: {
        address: createOrganizationDto.address,
        latitude: createOrganizationDto.latitude,
        longitude: createOrganizationDto.longitude,
      },
    });

    return this.prisma.organization.create({
      data: {
        name: createOrganizationDto.name,
        type: createOrganizationDto.type,
        mission: createOrganizationDto.mission,
        contactInfo: {
          connect: { id: contactInfo.id },
        },
        address: {
          connect: { id: address.id },
        },
      },
    });
  }

  findAll() {
    return this.prisma.organization.findMany();
  }

  findOne(id: number) {
    return this.prisma.organization.findUnique({
      where: { id: Number(id) },
    });
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: Number(id) },
      include: {
        contactInfo: true,
        address: true,
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const updatedContactInfo = await this.prisma.contactInfo.update({
      where: { id: organization.contactInfoId },
      data: {
        phone: updateOrganizationDto.phone,
        email: updateOrganizationDto.email,
        contactName: updateOrganizationDto.contactName,
        contactPhone: updateOrganizationDto.contactPhone,
        contactEmail: updateOrganizationDto.contactEmail,
      },
    });

    const updatedAddress = await this.prisma.address.update({
      where: { id: organization.addressId },
      data: {
        address: updateOrganizationDto.address,
        latitude: updateOrganizationDto.latitude,
        longitude: updateOrganizationDto.longitude,
      },
    });

    return this.prisma.organization.update({
      where: { id: Number(id) },
      data: {
        name: updateOrganizationDto.name,
        type: updateOrganizationDto.type,
        mission: updateOrganizationDto.mission,
        contactInfo: {
          connect: { id: updatedContactInfo.id },
        },
        address: {
          connect: { id: updatedAddress.id },
        },
        latitude: updateOrganizationDto.latitude,
        longitude: updateOrganizationDto.longitude,
      },
    });
  }

  remove(id: number) {
    return this.prisma.organization.delete({
      where: { id: Number(id) },
    });
  }

  sendMessage(id: number, createMessageDto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        organization: {
          connect: { id: id },
        },
      },
    });
  }
}
