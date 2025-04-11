import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCampaignDto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        goalAmount: createCampaignDto.goalAmount
          ? String(createCampaignDto.goalAmount)
          : undefined,
      },
    });
  }

  async findAll(skip?: number, take?: number) {
    const campaigns = await this.prisma.campaign.findMany({
      skip,
      take,
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    const total = await this.prisma.campaign.count();

    return {
      data: campaigns,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    try {
      return await this.prisma.campaign.update({
        where: { id },
        data: {
          ...updateCampaignDto,
          goalAmount: updateCampaignDto.goalAmount
            ? String(updateCampaignDto.goalAmount)
            : undefined,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Campaign with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.campaign.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Campaign with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getCampaignProgress(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { goalAmount: true },
    });

    if (!campaign || !campaign.goalAmount) {
      throw new NotFoundException(
        `Campaign with ID ${campaignId} not found or has no goal amount`,
      );
    }

    const totalRaised = await this.prisma.donation.aggregate({
      where: { campaignId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const raisedAmount = Number(totalRaised._sum.amount) || 0;
    const goalAmount = Number(campaign.goalAmount);
    const percentageAchieved = (raisedAmount / goalAmount) * 100;

    return {
      goalAmount,
      totalRaised: raisedAmount,
      percentageAchieved: Math.min(percentageAchieved, 100),
    };
  }
}
