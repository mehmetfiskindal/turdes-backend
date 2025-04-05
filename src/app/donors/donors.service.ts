import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { Role } from '../casl/action';

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDonation(createDonationDto: CreateDonationDto) {
    const { amount, donorId, userId, anonymous = false } = createDonationDto;

    return this.prisma.donation.create({
      data: {
        amount,
        donor: {
          connect: { id: donorId },
        },
        user: {
          connect: { id: userId },
        },
        anonymous,
      },
    });
  }

  async findAllDonations() {
    return this.prisma.donation.findMany({
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findUserDonations(userId: string) {
    return this.prisma.donation.findMany({
      where: { userId: Number(userId) },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findDonationById(id: string, user: any) {
    const donation = await this.prisma.donation.findUnique({
      where: { id: Number(id) },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!donation) {
      throw new NotFoundException(`Donation with ID ${id} not found`);
    }

    // Admin ve OrganizationOwner her bağışı görebilir
    if (user.role === Role.Admin || user.role === Role.OrganizationOwner) {
      return donation;
    }

    // Kullanıcı sadece kendi bağışını görebilir
    if (donation.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to view this donation',
      );
    }

    return donation;
  }

  async findAnonymousDonations() {
    return this.prisma.donation.findMany({
      where: { anonymous: true },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        userId: true,
        // Exclude donor personal information
        donor: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async getDonationStatistics() {
    const allDonations = await this.prisma.donation.findMany();
    const anonymousDonations = await this.prisma.donation.findMany({
      where: { anonymous: true },
    });

    const totalAmount = allDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0,
    );
    const anonymousAmount = anonymousDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0,
    );

    return {
      totalDonations: allDonations.length,
      anonymousDonations: anonymousDonations.length,
      totalAmount,
      anonymousAmount,
      averageDonation: totalAmount / (allDonations.length || 1),
    };
  }
}
