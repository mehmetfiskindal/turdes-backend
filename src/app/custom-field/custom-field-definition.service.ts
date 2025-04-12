import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomFieldDefinitionDto } from './dto/create-custom-field-definition.dto';
import { UpdateCustomFieldDefinitionDto } from './dto/update-custom-field-definition.dto';
import { CustomFieldDefinition, CustomFieldType } from '@prisma/client';

@Injectable()
export class CustomFieldDefinitionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tüm özel alan tanımlarını getirir
   */
  async findAll(): Promise<CustomFieldDefinition[]> {
    return this.prisma.customFieldDefinition.findMany();
  }

  /**
   * ID'ye göre bir özel alan tanımı getirir
   */
  async findOne(id: string): Promise<CustomFieldDefinition> {
    const fieldDefinition = await this.prisma.customFieldDefinition.findUnique({
      where: { id },
    });

    if (!fieldDefinition) {
      throw new NotFoundException(`ID: ${id} ile özel alan tanımı bulunamadı`);
    }

    return fieldDefinition;
  }

  /**
   * Yeni bir özel alan tanımı oluşturur
   */
  async create(
    createDto: CreateCustomFieldDefinitionDto,
  ): Promise<CustomFieldDefinition> {
    // Alan adı benzersiz olmalı, kontrol et
    const existingField = await this.prisma.customFieldDefinition.findUnique({
      where: { fieldName: createDto.fieldName },
    });

    if (existingField) {
      throw new ConflictException(
        `"${createDto.fieldName}" adıyla bir alan zaten mevcut`,
      );
    }

    // SELECT tipi için options gerekli, diğer tipler için options yok
    if (
      createDto.fieldType === CustomFieldType.SELECT &&
      (!createDto.options || createDto.options.length === 0)
    ) {
      throw new ConflictException(
        'SELECT tipi alanlar için en az bir seçenek belirtilmelidir',
      );
    }

    // SELECT dışındaki tipler için options belirtilmişse temizleyelim
    const options =
      createDto.fieldType === CustomFieldType.SELECT ? createDto.options : [];

    return this.prisma.customFieldDefinition.create({
      data: {
        fieldName: createDto.fieldName,
        fieldType: createDto.fieldType,
        options: options || [],
      },
    });
  }

  /**
   * Mevcut bir özel alan tanımını günceller
   */
  async update(
    id: string,
    updateDto: UpdateCustomFieldDefinitionDto,
  ): Promise<CustomFieldDefinition> {
    // Tanımın mevcut olup olmadığını kontrol et
    const existingDefinition =
      await this.prisma.customFieldDefinition.findUnique({
        where: { id },
      });

    if (!existingDefinition) {
      throw new NotFoundException(`ID: ${id} ile özel alan tanımı bulunamadı`);
    }

    // Alan adı güncelleniyorsa benzersizlik kontrolü yap
    if (
      updateDto.fieldName &&
      updateDto.fieldName !== existingDefinition.fieldName
    ) {
      const nameExists = await this.prisma.customFieldDefinition.findUnique({
        where: { fieldName: updateDto.fieldName },
      });

      if (nameExists) {
        throw new ConflictException(
          `"${updateDto.fieldName}" adıyla bir alan zaten mevcut`,
        );
      }
    }

    // Field tipi SELECT ise options kontrolü
    const fieldType = updateDto.fieldType || existingDefinition.fieldType;
    let options = existingDefinition.options;

    // SELECT tipi için options gerekli
    if (fieldType === CustomFieldType.SELECT) {
      if (updateDto.options) {
        options = updateDto.options;
      } else if (existingDefinition.fieldType !== CustomFieldType.SELECT) {
        // Mevcut field SELECT değildi ama güncelleme ile SELECT olacak, options gerekli
        throw new ConflictException(
          'SELECT tipi alanlar için en az bir seçenek belirtilmelidir',
        );
      }
    } else {
      // SELECT dışındaki tipler için options temizle
      options = [];
    }

    return this.prisma.customFieldDefinition.update({
      where: { id },
      data: {
        fieldName: updateDto.fieldName || existingDefinition.fieldName,
        fieldType,
        options,
      },
    });
  }

  /**
   * Bir özel alan tanımını siler
   */
  async remove(id: string): Promise<CustomFieldDefinition> {
    // Tanımın mevcut olup olmadığını kontrol et
    const existingDefinition =
      await this.prisma.customFieldDefinition.findUnique({
        where: { id },
        include: { customFields: true },
      });

    if (!existingDefinition) {
      throw new NotFoundException(`ID: ${id} ile özel alan tanımı bulunamadı`);
    }

    // Eğer bu tanıma bağlı custom field değerleri varsa, önce onları sil
    if (existingDefinition.customFields.length > 0) {
      await this.prisma.stakeholderCustomField.deleteMany({
        where: { fieldDefinitionId: id },
      });
    }

    return this.prisma.customFieldDefinition.delete({
      where: { id },
    });
  }
}
