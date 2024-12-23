import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateAidDistributionReport(startDate: string, endDate: string) {
    const aidRequests = await this.prisma.aidRequest.findMany({
      where: {
        user: {
          name: {
            gte: startDate,
            lte: endDate,
          },
        },
        organization: {
          name: {
            gte: startDate,
            lte: endDate,
          },
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
    }));

    return reportData;
  }

  async generateDonationDistributionReport(startDate: string, endDate: string) {
    const donations = await this.prisma.donation.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
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

  async generateVolunteerActivityReport(startDate: string, endDate: string) {
    const volunteers = await this.prisma.volunteer.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Process the volunteers data to generate the report
    const reportData = volunteers.map((volunteer) => ({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      tasks: volunteer.tasks,
      createdAt: volunteer.createdAt,
    }));

    return reportData;
  }

  async generateDonorActivityReport(startDate: string, endDate: string) {
    const donors = await this.prisma.donor.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Process the donors data to generate the report
    const reportData = donors.map((donor) => ({
      id: donor.id,
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      createdAt: donor.createdAt,
    }));

    return reportData;
  }
}
