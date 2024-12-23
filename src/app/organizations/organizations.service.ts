import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateMessageDto } from './dto/create-message.dto';

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
      where: { id: Number(id) },
    });
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id: Number(id) },
      data: updateOrganizationDto,
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
