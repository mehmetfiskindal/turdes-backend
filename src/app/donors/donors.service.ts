import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { Role } from '../casl/action';

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDonation(createDonationDto: CreateDonationDto) {
    const { amount, donorId, userId, anonymous = false } = createDonationDto;

    // Bağış miktarı kontrolü
    if (!amount || amount <= 0) {
      throw new BadRequestException('Bağış miktarı sıfırdan büyük olmalıdır');
    }

    // Bağışçının var olup olmadığını kontrol ediyoruz
    const donorExists = await this.prisma.donor.findUnique({
      where: { id: donorId },
    });

    if (!donorExists) {
      throw new NotFoundException(`${donorId} ID'li bağışçı bulunamadı`);
    }

    // Kullanıcının var olup olmadığını kontrol ediyoruz
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException(`${userId} ID'li kullanıcı bulunamadı`);
    }

    try {
      return await this.prisma.donation.create({
        data: {
          amount: String(amount), // Decimal tipine uygun olarak string'e dönüştür
          anonymous,
          status: 'COMPLETED', // Varsayılan durum
          paymentMethod: 'CASH', // Varsayılan ödeme yöntemi
          donationDate: new Date(), // Bağış tarihi
          legacyUser: {
            connect: { id: Number(userId) },
          },
          legacyDonor: {
            connect: { id: Number(donorId) },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Bağış oluşturulurken bir hata oluştu: ${error.message}`,
      );
    }
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
      where: { legacyUserId: Number(userId) }, // userId yerine legacyUserId kullan
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
      where: { id }, // ID artık string tipinde olduğu için dönüşüm yapmıyoruz
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
      throw new NotFoundException(`Bağış ${id} ID'li bulunamadı`);
    }

    // Admin ve OrganizationOwner her bağışı görebilir
    if (user.role === Role.Admin || user.role === Role.OrganizationOwner) {
      return donation;
    }

    // Kullanıcı sadece kendi bağışını görebilir
    if (donation.legacyUserId !== user.id) {
      throw new ForbiddenException('Bu bağışı görüntüleme izniniz yok');
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
        legacyUserId: true, // userId yerine legacyUserId kullanıyoruz
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
      (sum, donation) => sum + Number(donation.amount),
      0,
    );
    const anonymousAmount = anonymousDonations.reduce(
      (sum, donation) => sum + Number(donation.amount),
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
