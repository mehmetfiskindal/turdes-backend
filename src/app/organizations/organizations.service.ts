import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    try {
      const contactInfo = await this.prisma.contactInfo.create({
        data: {
          phone: createOrganizationDto.phone,
          email: createOrganizationDto.email,
          contactName: createOrganizationDto.contactName,
          contactPhone: createOrganizationDto.contactPhone,
          contactEmail: createOrganizationDto.contactEmail,
        },
      });

      const address = await this.prisma.address.create({
        data: {
          address: createOrganizationDto.address,
          latitude: createOrganizationDto.latitude,
          longitude: createOrganizationDto.longitude,
        },
      });

      return this.prisma.organization.create({
        data: {
          name: createOrganizationDto.name,
          type: createOrganizationDto.type,
          mission: createOrganizationDto.mission,
          contactInfo: {
            connect: { id: contactInfo.id },
          },
          address: {
            connect: { id: address.id },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Organizasyon oluşturulurken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.organization.findMany();
    } catch (error) {
      throw new BadRequestException(
        `Organizasyonlar listelenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: Number(id) },
    });

    if (!organization) {
      throw new NotFoundException(`${id} ID'li organizasyon bulunamadı`);
    }

    return organization;
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: Number(id) },
      include: {
        contactInfo: true,
        address: true,
      },
    });

    if (!organization) {
      throw new NotFoundException(`${id} ID'li organizasyon bulunamadı`);
    }

    try {
      const updatedContactInfo = await this.prisma.contactInfo.update({
        where: { id: organization.contactInfoId },
        data: {
          phone: updateOrganizationDto.phone,
          email: updateOrganizationDto.email,
          contactName: updateOrganizationDto.contactName,
          contactPhone: updateOrganizationDto.contactPhone,
          contactEmail: updateOrganizationDto.contactEmail,
        },
      });

      const updatedAddress = await this.prisma.address.update({
        where: { id: organization.addressId },
        data: {
          address: updateOrganizationDto.address,
          latitude: updateOrganizationDto.latitude,
          longitude: updateOrganizationDto.longitude,
        },
      });

      return this.prisma.organization.update({
        where: { id: Number(id) },
        data: {
          name: updateOrganizationDto.name,
          type: updateOrganizationDto.type,
          mission: updateOrganizationDto.mission,
          contactInfo: {
            connect: { id: updatedContactInfo.id },
          },
          address: {
            connect: { id: updatedAddress.id },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Organizasyon güncellenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: Number(id) },
    });

    if (!organization) {
      throw new NotFoundException(`${id} ID'li organizasyon bulunamadı`);
    }

    try {
      return await this.prisma.organization.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      throw new BadRequestException(
        `Organizasyon silinirken bir hata oluştu. Organizasyona bağlı yardım talepleri veya diğer ilişkiler olabilir.`,
      );
    }
  }

  async sendMessage(createMessageDto: CreateMessageDto) {
    // Organizasyonun varlığını kontrol et
    const organization = await this.prisma.organization.findUnique({
      where: { id: createMessageDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `${createMessageDto.organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    // Gönderen ve alıcının varlığını kontrol et
    const sender = await this.prisma.user.findUnique({
      where: { id: createMessageDto.senderId },
    });

    if (!sender) {
      throw new NotFoundException(
        `${createMessageDto.senderId} ID'li gönderen kullanıcı bulunamadı`,
      );
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: createMessageDto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException(
        `${createMessageDto.receiverId} ID'li alıcı kullanıcı bulunamadı`,
      );
    }

    // İçerik kontrolü
    if (!createMessageDto.content || createMessageDto.content.trim() === '') {
      throw new BadRequestException('Mesaj içeriği boş olamaz');
    }

    try {
      return await this.prisma.message.create({
        data: {
          content: createMessageDto.content,
          organization: {
            connect: {
              id: createMessageDto.organizationId,
            },
          },
          sender: {
            connect: {
              id: createMessageDto.senderId,
            },
          },
          receiver: {
            connect: {
              id: createMessageDto.receiverId,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Mesaj gönderilirken bir hata oluştu');
    }
  }

  async createMessage(
    content: string,
    organizationId: number,
    senderId: number,
    receiverId: number,
  ) {
    if (!content || content.trim() === '') {
      throw new BadRequestException('Mesaj içeriği boş olamaz');
    }

    // Organizasyonun varlığını kontrol et
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `${organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    // Gönderen ve alıcının varlığını kontrol et
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException(
        `${senderId} ID'li gönderen kullanıcı bulunamadı`,
      );
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException(
        `${receiverId} ID'li alıcı kullanıcı bulunamadı`,
      );
    }

    try {
      return await this.prisma.message.create({
        data: {
          content,
          organization: { connect: { id: organizationId } },
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: receiverId } },
        },
      });
    } catch (error) {
      throw new BadRequestException('Mesaj oluşturulurken bir hata oluştu');
    }
  }

  async addRatingAndFeedback(
    organizationId: number,
    rating: number,
    feedback: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Değerlendirme 1 ile 5 arasında olmalıdır');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `${organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    try {
      return await this.prisma.organization.update({
        where: { id: organizationId },
        data: {
          rating,
          feedback,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Değerlendirme eklenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async flagOrganization(organizationId: number, reason: string) {
    // Organizasyonun varlığını kontrol et
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `${organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    if (!reason || reason.trim() === '') {
      throw new BadRequestException(
        'Organizasyon için şikayet sebebi belirtilmelidir',
      );
    }

    try {
      // Yöneticiler için bildirim oluştur
      await this.prisma.notification.create({
        data: {
          content: `Organizasyon ${organization.name} şikayet edildi. Sebep: ${reason}`,
          userId: 1, // Varsayılan olarak 1 ID'li admin kullanıcısı, uygun admin ID'si ile değiştirilmeli
        },
      });

      return {
        success: true,
        message: `${organization.name} isimli organizasyon incelenmek üzere işaretlendi.`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Organizasyon şikayet edilirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async rateOrganization(organizationId: number, ratingData: any) {
    const { rating, feedback, userId, anonymous = false } = ratingData;

    // Değerlendirmenin 1-5 arasında olduğunu doğrula
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Değerlendirme 1 ile 5 arasında olmalıdır');
    }

    // Organizasyon varlığını kontrol et
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { rating: true, name: true },
    });

    if (!organization) {
      throw new NotFoundException(
        `${organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    // Kullanıcı varlığını kontrol et (anonim değilse)
    if (!anonymous && userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`${userId} ID'li kullanıcı bulunamadı`);
      }
    }

    try {
      // Bu belirli değerlendirmenin bir kaydını oluştur
      // Şimdilik bir değerlendirme tablosu olmadığı için simüle ediyoruz
      await this.prisma.notification.create({
        data: {
          content: `${organization.name} organizasyonu${anonymous ? ' anonim olarak' : ''} ${rating} yıldız değerlendirme aldı: "${feedback}"`,
          userId: 1, // Admin kullanıcı ID'si
        },
      });

      // Organizasyonu yeni değerlendirme ve geri bildirim ile güncelle
      // Gerçek bir uygulamada, tüm değerlendirmelerin ortalamasını hesaplarsınız
      const updatedOrganization = await this.prisma.organization.update({
        where: { id: organizationId },
        data: {
          rating: organization.rating
            ? (organization.rating + rating) / 2
            : rating,
          // Mevcut geri bildirimlere yeni geri bildirimleri ekle veya başlat
          feedback: (organization as any).feedback
            ? `${(organization as any).feedback}\n---\n${anonymous ? 'Anonim' : `Kullanıcı ${userId}`}: ${feedback}`
            : `${anonymous ? 'Anonim' : `Kullanıcı ${userId}`}: ${feedback}`,
        },
      });

      return {
        success: true,
        message: 'Değerlendirme başarıyla gönderildi',
        currentRating: updatedOrganization.rating,
      };
    } catch (error) {
      throw new BadRequestException(
        `Değerlendirme gönderilirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async getOrganizationRatings(organizationId: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        rating: true,
        feedback: true,
      },
    });

    if (!organization) {
      throw new NotFoundException(
        `${organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    try {
      // Geri bildirim kayıtlarını ayrıştır (eğer varsa)
      const feedbackEntries = organization.feedback
        ? organization.feedback.split('\n---\n').map((entry) => {
            const [author, ...contentParts] = entry.split(': ');
            const content = contentParts.join(': '); // İçerikte iki nokta üst üste olması durumunda yeniden birleştirme
            return {
              author,
              content,
              isAnonymous: author === 'Anonymous',
            };
          })
        : [];

      return {
        id: organization.id,
        name: organization.name,
        rating: organization.rating || 0,
        feedbackEntries,
      };
    } catch (error) {
      throw new BadRequestException(
        `Organizasyon değerlendirmeleri alınırken bir hata oluştu: ${error.message}`,
      );
    }
  }
}
