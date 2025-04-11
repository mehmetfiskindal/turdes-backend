import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // PrismaService yolunu doğrulayın
import { CreateStakeholderDto } from './dto/create-stakeholder.dto';
import { UpdateStakeholderDto } from './dto/update-stakeholder.dto';
import { Stakeholder, Interaction } from '@prisma/client'; // Import Interaction as well

@Injectable()
export class StakeholderService {
  constructor(private prisma: PrismaService) {}

  async create(
    createStakeholderDto: CreateStakeholderDto,
  ): Promise<Stakeholder> {
    return this.prisma.stakeholder.create({
      data: createStakeholderDto,
    });
  }

  async findAll(): Promise<Stakeholder[]> {
    return this.prisma.stakeholder.findMany();
  }

  async findOne(id: string): Promise<Stakeholder> {
    const stakeholder = await this.prisma.stakeholder.findUnique({
      where: { id },
    });
    if (!stakeholder) {
      throw new NotFoundException(`Stakeholder with ID "${id}" not found`);
    }
    return stakeholder;
  }

  async update(
    id: string,
    updateStakeholderDto: UpdateStakeholderDto,
  ): Promise<Stakeholder> {
    try {
      return await this.prisma.stakeholder.update({
        where: { id },
        data: updateStakeholderDto,
      });
    } catch (error) {
      // Handle potential errors, e.g., record not found
      if (error.code === 'P2025') {
        // Prisma error code for record not found
        throw new NotFoundException(`Stakeholder with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Stakeholder> {
    try {
      return await this.prisma.stakeholder.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Stakeholder with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async getDetailedStakeholderProfile(
    id: string,
  ): Promise<Stakeholder & { interactions: Interaction[] }> {
    const stakeholder = await this.prisma.stakeholder.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { date: 'desc' }, // Optionally order interactions
        },
      },
    });

    if (!stakeholder) {
      throw new NotFoundException(`Stakeholder with ID "${id}" not found`);
    }

    // The return type explicitly includes interactions based on the include query
    return stakeholder as Stakeholder & { interactions: Interaction[] };
  }
}
