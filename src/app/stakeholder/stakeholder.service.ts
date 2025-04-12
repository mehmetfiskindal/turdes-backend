import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // PrismaService yolunu doğrulayın
import { CreateStakeholderDto } from './dto/create-stakeholder.dto';
import { UpdateStakeholderDto } from './dto/update-stakeholder.dto';
import {
  Stakeholder,
  Interaction,
  CustomFieldType,
  StakeholderCustomField,
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
}
