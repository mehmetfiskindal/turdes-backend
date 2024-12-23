import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateAidDistributionReport(startDate: string, endDate: string) {
    const aidRequests = await this.prisma.aidRequest.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        user: true,
        organization: true,
      },
    });

    // Process the aidRequests data to generate the report
    const reportData = aidRequests.map((request) => ({
      id: request.id,
      type: request.type,
      description: request.description,
      status: request.status,
      user: request.user.name,
      organization: request.organization?.name,
      createdAt: request.createdAt,
    }));

    return reportData;
  }

  async generateDonationDistributionReport(startDate: string, endDate: string) {
    const donations = await this.prisma.donation.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        donor: true,
      },
    });

    // Process the donations data to generate the report
    const reportData = donations.map((donation) => ({
      id: donation.id,
      amount: donation.amount,
      donor: donation.donor.name,
      createdAt: donation.createdAt,
    }));

    return reportData;
  }
}
