import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async queueThankYouEmail(donationId: string): Promise<void> {
    try {
      // Bağış bilgilerini al
      const donation = await this.prisma.donation.findUnique({
        where: { id: donationId },
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!donation) {
        this.logger.error(`Donation with ID ${donationId} not found`);
        return;
      }

      // Eğer bağış anonim ise veya bağışçının e-posta adresi yoksa işlem yapma
      if (donation.anonymous || !donation.donor?.email) {
        this.logger.log(
          `Skipping thank you email for donation ${donationId}: ${donation.anonymous ? 'anonymous donation' : 'no donor email'}`,
        );
        return;
      }

      // Burada e-posta gönderimi veya kuyruk işlemi yapılacak
      // Şimdilik sadece loglama yapılıyor
      this.logger.log(
        `[TEŞEKKÜR E-POSTASI] Kuyruğa alındı: ${donation.donor.email} adresine "${donation.campaign?.name || 'Genel bağış'}" için ${donation.amount} tutarında bağışı için teşekkür e-postası gönderilecek.`,
      );

      // Gerçek implementasyonda burada bir kuyruk servisi kullanılabilir
      // Örnek: this.queueService.add('send-email', { type: 'THANK_YOU', donationId, email: donation.donor.email });
    } catch (error) {
      this.logger.error(
        `Error queueing thank you email for donation ${donationId}: ${error.message}`,
      );
    }
  }
}
