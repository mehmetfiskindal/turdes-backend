import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}

  async recordDonation(createDonationDto: CreateDonationDto) {
    // Kampanya kontrolü (opsiyonel)
    if (createDonationDto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: createDonationDto.campaignId },
      });

      if (!campaign) {
        throw new NotFoundException(
          `Campaign with ID ${createDonationDto.campaignId} not found`,
        );
      }
    }

    // Bağışçı kontrolü (opsiyonel)
    if (createDonationDto.donorId) {
      const donor = await this.prisma.stakeholder.findUnique({
        where: { id: createDonationDto.donorId },
      });

      if (!donor) {
        throw new NotFoundException(
          `Stakeholder with ID ${createDonationDto.donorId} not found`,
        );
      }
    }

    return this.prisma.donation.create({
      data: {
        ...createDonationDto,
        amount: createDonationDto.amount.toString(),
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(skip?: number, take?: number) {
    const donations = await this.prisma.donation.findMany({
      skip,
      take,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
      orderBy: {
        donationDate: 'desc',
      },
    });

    const total = await this.prisma.donation.count();

    return {
      data: donations,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findById(id: string) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
    });

    if (!donation) {
      throw new NotFoundException(`Donation with ID ${id} not found`);
    }

    return donation;
  }

  async findByCampaignId(campaignId: string, skip?: number, take?: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const donations = await this.prisma.donation.findMany({
      where: { campaignId },
      skip,
      take,
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
      orderBy: {
        donationDate: 'desc',
      },
    });

    const total = await this.prisma.donation.count({
      where: { campaignId },
    });

    return {
      data: donations,
      meta: {
        total,
        skip,
        take,
        campaign: {
          id: campaign.id,
          name: campaign.name,
        },
      },
    };
  }

  async findByDonorId(donorId: string, skip?: number, take?: number) {
    const donor = await this.prisma.stakeholder.findUnique({
      where: { id: donorId },
    });

    if (!donor) {
      throw new NotFoundException(`Stakeholder with ID ${donorId} not found`);
    }

    const donations = await this.prisma.donation.findMany({
      where: { donorId },
      skip,
      take,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        donationDate: 'desc',
      },
    });

    const total = await this.prisma.donation.count({
      where: { donorId },
    });

    return {
      data: donations,
      meta: {
        total,
        skip,
        take,
        donor: {
          id: donor.id,
          name: donor.name,
        },
      },
    };
  }

  async update(id: string, updateDonationDto: UpdateDonationDto) {
    try {
      // Kampanya kontrolü (opsiyonel)
      if (updateDonationDto.campaignId) {
        const campaign = await this.prisma.campaign.findUnique({
          where: { id: updateDonationDto.campaignId },
        });

        if (!campaign) {
          throw new NotFoundException(
            `Campaign with ID ${updateDonationDto.campaignId} not found`,
          );
        }
      }

      // Bağışçı kontrolü (opsiyonel)
      if (updateDonationDto.donorId) {
        const donor = await this.prisma.stakeholder.findUnique({
          where: { id: updateDonationDto.donorId },
        });

        if (!donor) {
          throw new NotFoundException(
            `Stakeholder with ID ${updateDonationDto.donorId} not found`,
          );
        }
      }

      return await this.prisma.donation.update({
        where: { id },
        data: {
          ...updateDonationDto,
          amount: updateDonationDto.amount
            ? updateDonationDto.amount.toString()
            : undefined,
        },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          donor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Donation with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.donation.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Donation with ID ${id} not found`);
      }
      throw error;
    }
  }
}
