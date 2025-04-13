import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // PrismaService yolunu doğrulayın
import { CreateStakeholderDto } from './dto/create-stakeholder.dto';
import { UpdateStakeholderDto } from './dto/update-stakeholder.dto';
import { FindSegmentedStakeholdersDto } from './dto/find-segmented-stakeholders.dto';
import {
  Stakeholder,
  Interaction,
  CustomFieldType,
  StakeholderCustomField,
  Prisma,
} from '@prisma/client'; // Import necessary types

@Injectable()
export class StakeholderService {
  constructor(private prisma: PrismaService) {}

  async create(
    createStakeholderDto: CreateStakeholderDto,
  ): Promise<Stakeholder> {
    return this.prisma.stakeholder.create({
      data: createStakeholderDto,
    });
  }

  async findAll(): Promise<Stakeholder[]> {
    return this.prisma.stakeholder.findMany();
  }

  async findOne(id: string): Promise<Stakeholder> {
    const stakeholder = await this.prisma.stakeholder.findUnique({
      where: { id },
    });
    if (!stakeholder) {
      throw new NotFoundException(`Stakeholder with ID "${id}" not found`);
    }
    return stakeholder;
  }

  async update(
    id: string,
    updateStakeholderDto: UpdateStakeholderDto,
  ): Promise<Stakeholder> {
    try {
      return await this.prisma.stakeholder.update({
        where: { id },
        data: updateStakeholderDto,
      });
    } catch (error) {
      // Handle potential errors, e.g., record not found
      if (error.code === 'P2025') {
        // Prisma error code for record not found
        throw new NotFoundException(`Stakeholder with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Stakeholder> {
    try {
      return await this.prisma.stakeholder.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Stakeholder with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async getDetailedStakeholderProfile(id: string): Promise<
    Stakeholder & {
      interactions: Interaction[];
      customFields: StakeholderCustomField[];
    }
  > {
    const stakeholder = await this.prisma.stakeholder.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { date: 'desc' },
        },
        customFields: {
          include: {
            fieldDefinition: true, // Alan tanımını da dahil et
          },
        },
      },
    });

    if (!stakeholder) {
      throw new NotFoundException(`Stakeholder with ID "${id}" not found`);
    }

    // Tip belirtimi güncellenmiş şekilde
    return stakeholder as Stakeholder & {
      interactions: Interaction[];
      customFields: StakeholderCustomField[];
    };
  }

  /**
   * Paydaş için özel alan değerini ekler veya günceller
   * @param stakeholderId - Paydaş ID'si
   * @param fieldName - Özel alan adı
   * @param value - Özel alan değeri
   * @returns Güncellenmiş özel alan değeri
   */
  async addOrUpdateCustomFieldValue(
    stakeholderId: string,
    fieldName: string,
    value: string,
  ) {
    // Önce paydaşın var olup olmadığını kontrol et
    const stakeholder = await this.prisma.stakeholder.findUnique({
      where: { id: stakeholderId },
    });

    if (!stakeholder) {
      throw new NotFoundException(`Paydaş ID'si ${stakeholderId} bulunamadı`);
    }

    // Alan tanımını bul
    const fieldDefinition = await this.prisma.customFieldDefinition.findUnique({
      where: { fieldName },
    });

    if (!fieldDefinition) {
      throw new NotFoundException(`Özel alan '${fieldName}' bulunamadı`);
    }

    // Alan tipine göre değeri doğrula
    if (
      fieldDefinition.fieldType === CustomFieldType.SELECT &&
      !fieldDefinition.options.includes(value)
    ) {
      throw new BadRequestException(
        `'${value}' değeri, '${fieldName}' alanı için geçerli bir seçenek değil. Geçerli seçenekler: ${fieldDefinition.options.join(', ')}`,
      );
    }

    // Boolean değerler için sadece 'true' veya 'false' kabul et
    if (
      fieldDefinition.fieldType === CustomFieldType.BOOLEAN &&
      value !== 'true' &&
      value !== 'false'
    ) {
      throw new BadRequestException(
        `'${fieldName}' alanı için sadece 'true' veya 'false' değeri girilebilir`,
      );
    }

    // Mevcut alan değeri var mı diye kontrol et
    const existingField = await this.prisma.stakeholderCustomField.findFirst({
      where: {
        stakeholderId,
        fieldDefinitionId: fieldDefinition.id,
      },
    });

    // Mevcut ise güncelle, yoksa oluştur
    if (existingField) {
      return this.prisma.stakeholderCustomField.update({
        where: { id: existingField.id },
        data: { value },
        include: { fieldDefinition: true }, // Alan tanımını da dahil et
      });
    } else {
      return this.prisma.stakeholderCustomField.create({
        data: {
          value,
          stakeholder: { connect: { id: stakeholderId } },
          fieldDefinition: { connect: { id: fieldDefinition.id } },
        },
        include: { fieldDefinition: true }, // Alan tanımını da dahil et
      });
    }
  }

  /**
   * Paydaş için tüm özel alanları getirir
   * @param stakeholderId - Paydaş ID'si
   * @returns Paydaşa ait tüm özel alanlar
   */
  async getCustomFieldsForStakeholder(stakeholderId: string) {
    // Önce paydaşın var olup olmadığını kontrol et
    const stakeholder = await this.prisma.stakeholder.findUnique({
      where: { id: stakeholderId },
    });

    if (!stakeholder) {
      throw new NotFoundException(`Paydaş ID'si ${stakeholderId} bulunamadı`);
    }

    // Paydaşın tüm özel alanlarını getir
    const customFields = await this.prisma.stakeholderCustomField.findMany({
      where: { stakeholderId },
      include: { fieldDefinition: true }, // Alan tanımını da dahil et
    });

    return customFields;
  }

  /**
   * Paydaşları segmentlere ayırarak filtreler ve getirir
   * @param filters - Segmentasyon filtreleri
   * @returns Filtrelenmiş paydaşlar ve toplam kayıt sayısı
   */
  async findSegmentedStakeholders(filters: FindSegmentedStakeholdersDto) {
    const {
      type,
      tagIds,
      totalDonationAmount,
      lastDonationDate,
      locationKeyword,
      customFields,
      page = 1,
      limit = 10,
    } = filters;

    // Temel where koşulları
    const where: Prisma.StakeholderWhereInput = {};

    // Tip filtrelemesi
    if (type) {
      // type string'ini StakeholderType enum değerine çeviriyoruz
      where.type = type as unknown as Prisma.EnumStakeholderTypeFilter;
    }

    // Etiket filtrelemesi (some ilişkisi)
    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: {
            in: tagIds,
          },
        },
      };
    }

    // Konum filtrelemesi
    if (locationKeyword) {
      where.address = {
        contains: locationKeyword,
        mode: 'insensitive', // Case insensitive arama
      };
    }

    // Özel alan filtreleri
    if (customFields && customFields.length > 0) {
      where.customFields = {
        some: {
          OR: customFields.map((cf) => ({
            AND: [
              {
                fieldDefinition: {
                  fieldName: cf.fieldName,
                },
              },
              {
                value: {
                  contains: cf.value,
                  mode: 'insensitive',
                },
              },
            ],
          })),
        },
      };
    }

    // Bağış miktarı aralığı filtreleri
    // Not: Bu kısım JSON alanına veya aggregate sorgusu ile yapılabilir
    const donationFilters: Prisma.DonationWhereInput = {}; // Bağış tarih aralığı filtreleri
    if (lastDonationDate?.start || lastDonationDate?.end) {
      donationFilters.donationDate = {};

      if (lastDonationDate.start) {
        donationFilters.donationDate.gte = lastDonationDate.start;
      }

      if (lastDonationDate.end) {
        donationFilters.donationDate.lte = lastDonationDate.end;
      }
    }

    // Toplam bağış miktarı filtreleri için paydaşlarla birlikte bağışları da getirelim
    // Daha sonra JS tarafında filtreleme yapacağız
    const stakeholders = await this.prisma.stakeholder.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        donations: {
          where: donationFilters,
        },
        customFields: {
          include: {
            fieldDefinition: true,
          },
        },
      },
      // Sayfalama için
      skip: (page - 1) * limit,
      take: limit,
    });

    // Toplam kayıt sayısı
    const total = await this.prisma.stakeholder.count({ where });

    // Eğer bağış miktarı filtresi varsa, JS tarafında filtreleme yapalım
    let filteredStakeholders = stakeholders;

    if (
      totalDonationAmount?.min !== undefined ||
      totalDonationAmount?.max !== undefined
    ) {
      filteredStakeholders = stakeholders.filter((stakeholder) => {
        const totalAmount = stakeholder.donations.reduce(
          (sum, donation) => sum + Number(donation.amount),
          0,
        );

        if (
          totalDonationAmount.min !== undefined &&
          totalAmount < totalDonationAmount.min
        ) {
          return false;
        }

        if (
          totalDonationAmount.max !== undefined &&
          totalAmount > totalDonationAmount.max
        ) {
          return false;
        }

        return true;
      });
    }

    return {
      data: filteredStakeholders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Bir paydaşın bağlılık skorunu hesaplar
   * @param stakeholderId - Paydaş ID'si
   * @returns Hesaplanan bağlılık skoru (0-100 arası)
   */
  async calculateEngagementScore(stakeholderId: string): Promise<number> {
    try {
      // Paydaşın var olup olmadığını kontrol et
      const stakeholder = await this.prisma.stakeholder.findUnique({
        where: {
          id: stakeholderId,
        },
      });

      if (!stakeholder) {
        throw new NotFoundException(`Paydaş ID'si ${stakeholderId} bulunamadı`);
      }

      // Bağışlar hakkında veri topla
      const donations = await this.prisma.donation.findMany({
        where: {
          donorId: stakeholderId,
          status: 'COMPLETED',
        },
        orderBy: {
          donationDate: 'desc',
        },
      });

      // Etkileşimler hakkında veri topla
      const interactions = await this.prisma.interaction.findMany({
        where: {
          stakeholderId: stakeholderId,
        },
        orderBy: {
          date: 'desc',
        },
      });

      // Görevler hakkında veri topla
      const tasks = await this.prisma.task.findMany({
        where: {
          stakeholderId: stakeholderId,
        },
        orderBy: {
          dueDate: 'desc',
        },
      });

      // Skorlama değişkenleri
      let score = 0;
      const now = new Date();
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);

      // 1. Toplam bağış miktarı (max 40 puan)
      const totalDonationAmount = donations.reduce(
        (sum, donation) => sum + Number(donation.amount),
        0,
      );

      // Toplam bağış miktarına göre puanlama (örneğin 10.000 TL üzeri tam puan)
      const donationAmountScore = Math.min(totalDonationAmount / 250, 40);
      score += donationAmountScore;

      // 2. Bağış sıklığı - son 1 yıldaki bağış sayısı (max 20 puan)
      const recentDonations = donations.filter(
        (d) => new Date(d.donationDate) >= oneYearAgo,
      );

      // Her bir bağış 4 puan, en fazla 20 puan
      const donationFrequencyScore = Math.min(recentDonations.length * 4, 20);
      score += donationFrequencyScore;

      // 3. Son etkileşim tarihi (max 15 puan)
      if (interactions.length > 0) {
        const lastInteractionDate = new Date(interactions[0].date);
        const daysSinceLastInteraction = Math.floor(
          (now.getTime() - lastInteractionDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Son 30 gün içinde etkileşim varsa tam puan,
        // 180+ gün ise 0 puan, aradaki değerler için ölçekli puanlama
        const lastInteractionScore =
          daysSinceLastInteraction <= 30
            ? 15
            : daysSinceLastInteraction >= 180
              ? 0
              : 15 * (1 - (daysSinceLastInteraction - 30) / 150);

        score += lastInteractionScore;
      }

      // 4. Etkileşim sayısı (max 15 puan)
      // Her etkileşim 3 puan, en fazla 15 puan
      const interactionCountScore = Math.min(interactions.length * 3, 15);
      score += interactionCountScore;

      // 5. Tamamlanan görevler (max 10 puan)
      const completedTasks = tasks.filter(
        (t) => t.status === 'COMPLETED',
      ).length;
      // Her tamamlanan görev 2 puan, en fazla 10 puan
      const tasksScore = Math.min(completedTasks * 2, 10);
      score += tasksScore;

      // Son skoru yuvarla (0-100 arası)
      return Math.round(Math.min(score, 100));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Bağlılık skoru hesaplanırken bir hata oluştu: ${error.message}`,
      );
    }
  }

  /**
   * Bir paydaşın bağlılık skorunu hesaplar ve kaydeder
   * @param stakeholderId - Paydaş ID'si
   * @returns Güncellenmiş paydaş bilgileri
   */
  async updateEngagementScore(stakeholderId: string): Promise<Stakeholder> {
    try {
      // Skoru hesapla
      const engagementScore =
        await this.calculateEngagementScore(stakeholderId);

      // Engagement Level'ı belirle
      let engagementLevel = 'LOW';
      if (engagementScore >= 70) {
        engagementLevel = 'HIGH';
      } else if (engagementScore >= 30) {
        engagementLevel = 'MEDIUM';
      }

      // Stakeholder'ı güncelle - raw SQL kullan çünkü prisma modeli henüz engagementScore tanımıyor
      await this.prisma.$executeRaw`
        UPDATE "Stakeholder"
        SET 
          "updatedAt" = NOW(), 
          "engagementScore" = ${engagementScore},
          "engagementLevel" = ${engagementLevel}::text
        WHERE "id" = ${stakeholderId}
      `;

      // Güncellenmiş paydaşı getir
      const updatedStakeholder = await this.prisma.stakeholder.findUnique({
        where: { id: stakeholderId },
      });

      return updatedStakeholder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Bağlılık skoru güncellenirken bir hata oluştu: ${error.message}`,
      );
    }
  }
}
