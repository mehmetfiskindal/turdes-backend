import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCampaign(createCampaignDto: CreateCampaignDto) {
    // Organizasyonun var olduğunu kontrol et
    const organization = await this.prisma.organization.findUnique({
      where: { id: createCampaignDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `${createCampaignDto.organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    // Kampanya isminin dolu olduğunu kontrol et
    if (!createCampaignDto.name || createCampaignDto.name.trim() === '') {
      throw new BadRequestException('Kampanya adı boş olamaz');
    }

    // Hedef tarih geçerli mi kontrol et
    if (
      createCampaignDto.endDate &&
      new Date(createCampaignDto.endDate) <= new Date()
    ) {
      throw new BadRequestException(
        'Kampanya bitiş tarihi gelecekte olmalıdır',
      );
    }

    try {
      return await this.prisma.campaign.create({
        data: {
          name: createCampaignDto.name,
          description: createCampaignDto.description,
          endDate: createCampaignDto.endDate,
          targetAmount: createCampaignDto.targetAmount,
          organization: {
            connect: { id: createCampaignDto.organizationId },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Kampanya oluşturulurken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async findAllCampaigns() {
    try {
      return await this.prisma.campaign.findMany();
    } catch (error) {
      throw new BadRequestException(
        `Kampanyalar listelenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async findCampaignById(id: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: Number(id) },
    });

    if (!campaign) {
      throw new NotFoundException(`${id} ID'li kampanya bulunamadı`);
    }

    return campaign;
  }

  async updateCampaign(id: number, updateCampaignDto: CreateCampaignDto) {
    // Kampanyanın var olup olmadığını kontrol et
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: Number(id) },
    });

    if (!campaign) {
      throw new NotFoundException(`${id} ID'li kampanya bulunamadı`);
    }

    // Organizasyonun varlığını kontrol et (eğer güncelleme içeriyorsa)
    if (updateCampaignDto.organizationId) {
      const organization = await this.prisma.organization.findUnique({
        where: { id: updateCampaignDto.organizationId },
      });

      if (!organization) {
        throw new NotFoundException(
          `${updateCampaignDto.organizationId} ID'li organizasyon bulunamadı`,
        );
      }
    }

    // Hedef tarih geçerli mi kontrol et (eğer güncelleme içeriyorsa)
    if (
      updateCampaignDto.endDate &&
      new Date(updateCampaignDto.endDate) <= new Date()
    ) {
      throw new BadRequestException(
        'Kampanya bitiş tarihi gelecekte olmalıdır',
      );
    }

    try {
      return await this.prisma.campaign.update({
        where: { id: Number(id) },
        data: updateCampaignDto,
      });
    } catch (error) {
      throw new BadRequestException(
        `Kampanya güncellenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async deleteCampaign(id: number) {
    // Kampanyanın var olup olmadığını kontrol et
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: Number(id) },
    });

    if (!campaign) {
      throw new NotFoundException(`${id} ID'li kampanya bulunamadı`);
    }

    // İlişkili etkinliklerin sayısını kontrol et
    const eventsCount = await this.prisma.event.count({
      where: { campaignId: Number(id) },
    });

    if (eventsCount > 0) {
      throw new BadRequestException(
        `Bu kampanyaya bağlı ${eventsCount} etkinlik bulunuyor. Önce etkinlikleri silmelisiniz.`,
      );
    }

    try {
      return await this.prisma.campaign.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      throw new BadRequestException(
        `Kampanya silinirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async createEvent(campaignId: number, createEventDto: CreateEventDto) {
    // Kampanyanın varlığını kontrol et
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`${campaignId} ID'li kampanya bulunamadı`);
    }

    // Organizasyonun varlığını kontrol et
    const organization = await this.prisma.organization.findUnique({
      where: { id: createEventDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `${createEventDto.organizationId} ID'li organizasyon bulunamadı`,
      );
    }

    // Etkinlik adının dolu olduğunu kontrol et
    if (!createEventDto.name || createEventDto.name.trim() === '') {
      throw new BadRequestException('Etkinlik adı boş olamaz');
    }

    // Etkinlik tarihinin geçerli olup olmadığını kontrol et
    if (createEventDto.date && new Date(createEventDto.date) < new Date()) {
      throw new BadRequestException('Etkinlik tarihi gelecekte olmalıdır');
    }

    try {
      return await this.prisma.event.create({
        data: {
          name: createEventDto.name,
          description: createEventDto.description,
          date: createEventDto.date,
          location: createEventDto.location,
          campaign: {
            connect: { id: campaignId },
          },
          organization: {
            connect: { id: createEventDto.organizationId },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Etkinlik oluşturulurken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async findAllEvents(campaignId: number) {
    // Kampanyanın varlığını kontrol et
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`${campaignId} ID'li kampanya bulunamadı`);
    }

    try {
      return await this.prisma.event.findMany({
        where: { campaignId: campaignId },
      });
    } catch (error) {
      throw new BadRequestException(
        `Etkinlikler listelenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async findEventById(campaignId: number, eventId: number) {
    // Kampanyanın varlığını kontrol et
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`${campaignId} ID'li kampanya bulunamadı`);
    }

    // Etkinliği bul
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        campaignId: campaignId,
      },
    });

    if (!event) {
      throw new NotFoundException(
        `${campaignId} ID'li kampanyada ${eventId} ID'li etkinlik bulunamadı`,
      );
    }

    return event;
  }

  async updateEvent(
    campaignId: number,
    eventId: number,
    updateEventDto: CreateEventDto,
  ) {
    // Kampanya ve etkinliğin varlığını kontrol et
    await this.findEventById(campaignId, eventId);

    // Organizasyonun varlığını kontrol et (eğer güncelleme içeriyorsa)
    if (updateEventDto.organizationId) {
      const organization = await this.prisma.organization.findUnique({
        where: { id: updateEventDto.organizationId },
      });

      if (!organization) {
        throw new NotFoundException(
          `${updateEventDto.organizationId} ID'li organizasyon bulunamadı`,
        );
      }
    }

    // Etkinlik tarihinin geçerli olup olmadığını kontrol et
    if (updateEventDto.date && new Date(updateEventDto.date) < new Date()) {
      throw new BadRequestException('Etkinlik tarihi gelecekte olmalıdır');
    }

    try {
      return await this.prisma.event.update({
        where: { id: eventId },
        data: updateEventDto,
      });
    } catch (error) {
      throw new BadRequestException(
        `Etkinlik güncellenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  async deleteEvent(campaignId: number, eventId: number) {
    // Kampanya ve etkinliğin varlığını kontrol et
    await this.findEventById(campaignId, eventId);

    try {
      return await this.prisma.event.delete({
        where: { id: eventId },
      });
    } catch (error) {
      throw new BadRequestException(
        `Etkinlik silinirken bir hata oluştu: ${error.message}`,
      );
    }
  }
}
