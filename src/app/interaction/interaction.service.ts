import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { Interaction } from '@prisma/client';

@Injectable()
export class InteractionService {
  constructor(private prisma: PrismaService) {}

  async create(
    createInteractionDto: CreateInteractionDto,
  ): Promise<Interaction> {
    // Ensure the stakeholder exists before creating the interaction
    const stakeholder = await this.prisma.stakeholder.findUnique({
      where: { id: createInteractionDto.stakeholderId },
    });
    if (!stakeholder) {
      throw new NotFoundException(
        `Stakeholder with ID "${createInteractionDto.stakeholderId}" not found`,
      );
    }

    return this.prisma.interaction.create({
      data: createInteractionDto,
    });
  }

  async findAll(): Promise<Interaction[]> {
    return this.prisma.interaction.findMany({ include: { stakeholder: true } }); // Optionally include stakeholder info
  }

  async findOne(id: string): Promise<Interaction> {
    const interaction = await this.prisma.interaction.findUnique({
      where: { id },
      include: { stakeholder: true }, // Optionally include stakeholder info
    });
    if (!interaction) {
      throw new NotFoundException(`Interaction with ID "${id}" not found`);
    }
    return interaction;
  }

  async findAllByStakeholder(stakeholderId: string): Promise<Interaction[]> {
    // Ensure the stakeholder exists first
    const stakeholder = await this.prisma.stakeholder.findUnique({
      where: { id: stakeholderId },
    });
    if (!stakeholder) {
      throw new NotFoundException(
        `Stakeholder with ID "${stakeholderId}" not found`,
      );
    }

    return this.prisma.interaction.findMany({
      where: { stakeholderId },
      orderBy: { date: 'desc' }, // Example: order by date descending
    });
  }

  async update(
    id: string,
    updateInteractionDto: UpdateInteractionDto,
  ): Promise<Interaction> {
    // Ensure stakeholderId is not updated if present in DTO, or validate it if allowed
    if (updateInteractionDto.stakeholderId) {
      const stakeholder = await this.prisma.stakeholder.findUnique({
        where: { id: updateInteractionDto.stakeholderId },
      });
      if (!stakeholder) {
        throw new NotFoundException(
          `Stakeholder with ID "${updateInteractionDto.stakeholderId}" not found`,
        );
      }
    }

    try {
      return await this.prisma.interaction.update({
        where: { id },
        data: updateInteractionDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Interaction with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Interaction> {
    try {
      return await this.prisma.interaction.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Interaction with ID "${id}" not found`);
      }
      throw error;
    }
  }
}
