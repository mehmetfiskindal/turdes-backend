import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { StakeholderService } from './stakeholder.service';
import { CreateStakeholderDto } from './dto/create-stakeholder.dto';
import { UpdateStakeholderDto } from './dto/update-stakeholder.dto';
import { CustomFieldValueDto } from './dto/custom-field-value.dto';
import { FindSegmentedStakeholdersDto } from './dto/find-segmented-stakeholders.dto';
import { FilterStakeholdersQueryDto } from './dto/filter-stakeholders-query.dto';
import {
  Stakeholder,
  Interaction,
  StakeholderCustomField,
} from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { Action } from '../casl/action';

@ApiTags('stakeholder') // Swagger tag'i ekle
@ApiBearerAuth() // Tüm endpoint'ler için JWT gerekliliğini belirt
@UseGuards(JwtAuthGuard, PoliciesGuard) // Guard'ları uygula
@Controller('stakeholder')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class StakeholderController {
  constructor(private readonly stakeholderService: StakeholderService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, 'Stakeholder'),
  ) // Yetki kontrolü ('Stakeholder' string'i kullanıldı)
  @ApiOperation({ summary: 'Yeni bir paydaş oluştur' }) // Operasyon özeti
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Paydaş başarıyla oluşturuldu.',
    type: CreateStakeholderDto, // DTO'yu referans göster
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz girdi.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  create(
    @Body() createStakeholderDto: CreateStakeholderDto,
  ): Promise<Stakeholder> {
    return this.stakeholderService.create(createStakeholderDto);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Stakeholder'),
  ) // Yetki kontrolü ('Stakeholder' string'i kullanıldı)
  @ApiOperation({ summary: 'Paydaşları filtrelerle listele' }) // Operasyon özeti güncellendi
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paydaşlar başarıyla listelendi.',
    type: [CreateStakeholderDto], // Dizi olarak DTO'yu referans göster
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz filtre parametreleri.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    filterDto: FilterStakeholdersQueryDto,
  ) {
    // Eğer herhangi bir filtre parametresi verilmişse, segmentasyon metodunu kullan
    if (this.hasFilters(filterDto)) {
      // Query parametrelerini segmentasyon DTO formatına dönüştür
      const segmentationFilters = this.mapToSegmentationFilters(filterDto);
      return this.stakeholderService.findSegmentedStakeholders(
        segmentationFilters,
      );
    }

    // Filtre yoksa tüm paydaşları getir
    return this.stakeholderService.findAll();
  }

  // Yeni endpoint: Detaylı profil getirme
  @Get('profile/:id')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Stakeholder'),
  ) // Yetki kontrolü ('Stakeholder' string'i kullanıldı)
  @ApiOperation({
    summary: 'Bir paydaşın detaylı profilini getir (etkileşimlerle birlikte)',
  }) // Operasyon özeti
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paydaş profili başarıyla getirildi.',
    // type: StakeholderDetailedProfileDto, // İleride daha spesifik bir DTO oluşturulabilir
    // Şimdilik Prisma tipini kullanıyoruz ama idealde bir DTO olmalı
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paydaş bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  getDetailedProfile(@Param('id') id: string): Promise<
    Stakeholder & {
      interactions: Interaction[];
      customFields: StakeholderCustomField[];
    }
  > {
    return this.stakeholderService.getDetailedStakeholderProfile(id);
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Stakeholder'),
  ) // Yetki kontrolü ('Stakeholder' string'i kullanıldı)
  @ApiOperation({ summary: 'ID ile tek bir paydaş getir' }) // Operasyon özeti
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paydaş başarıyla getirildi.',
    type: CreateStakeholderDto, // DTO'yu referans göster
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paydaş bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  findOne(@Param('id') id: string): Promise<Stakeholder> {
    return this.stakeholderService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'Stakeholder'),
  ) // Yetki kontrolü ('Stakeholder' string'i kullanıldı)
  @ApiOperation({ summary: 'Bir paydaşı güncelle' }) // Operasyon özeti
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paydaş başarıyla güncellendi.',
    type: CreateStakeholderDto, // Güncellenmiş DTO'yu referans göster
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz girdi.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paydaş bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  update(
    @Param('id') id: string,
    @Body() updateStakeholderDto: UpdateStakeholderDto,
  ): Promise<Stakeholder> {
    // Not: CASL daha detaylı alan bazlı kontrol de yapabilir,
    // ama şimdilik genel Update yetkisine bakıyoruz.
    // Servis katmanında veya guard içinde daha detaylı kontrol eklenebilir.
    return this.stakeholderService.update(id, updateStakeholderDto);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, 'Stakeholder'),
  ) // Yetki kontrolü ('Stakeholder' string'i kullanıldı)
  @ApiOperation({ summary: 'Bir paydaşı sil' }) // Operasyon özeti
  @ApiResponse({
    status: HttpStatus.OK, // Veya HttpStatus.NO_CONTENT (204) tercih edilebilir
    description: 'Paydaş başarıyla silindi.',
    type: CreateStakeholderDto, // Silinen DTO'yu referans göster
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paydaş bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  remove(@Param('id') id: string): Promise<Stakeholder> {
    return this.stakeholderService.remove(id);
  }

  // Özel alanlar için yeni endpoint'ler

  @Get(':id/custom-fields')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Stakeholder'),
  )
  @ApiOperation({ summary: 'Paydaş için tüm özel alanları getir' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Özel alanlar başarıyla getirildi.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paydaş bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  @ApiParam({ name: 'id', description: 'Paydaş ID' })
  getCustomFields(@Param('id') id: string): Promise<StakeholderCustomField[]> {
    return this.stakeholderService.getCustomFieldsForStakeholder(id);
  }

  @Post(':id/custom-fields')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'Stakeholder'),
  )
  @ApiOperation({ summary: 'Paydaşa özel alan ekle veya güncelle' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Özel alan başarıyla eklendi veya güncellendi.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz değer.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paydaş veya özel alan tanımı bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  @ApiParam({ name: 'id', description: 'Paydaş ID' })
  @ApiBody({ type: CustomFieldValueDto })
  addOrUpdateCustomField(
    @Param('id') id: string,
    @Body() customFieldValueDto: CustomFieldValueDto,
  ) {
    return this.stakeholderService.addOrUpdateCustomFieldValue(
      id,
      customFieldValueDto.fieldName,
      customFieldValueDto.value,
    );
  }

  @Post('segment')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Stakeholder'),
  )
  @ApiOperation({ summary: 'Paydaşları segmentlere göre filtrele ve getir' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paydaşlar başarıyla filtrelendi ve getirildi.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz filtre parametreleri.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  findSegmentedStakeholders(@Body() filters: FindSegmentedStakeholdersDto) {
    return this.stakeholderService.findSegmentedStakeholders(filters);
  }

  // Bağlılık skoru hesaplama endpoint'i
  @Get(':id/calculate-engagement')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Stakeholder'),
  )
  @ApiOperation({
    summary: 'Bir paydaşın bağlılık skorunu hesapla (kaydetmeden)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bağlılık skoru başarıyla hesaplandı.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paydaş bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  async calculateEngagement(@Param('id') id: string) {
    const score = await this.stakeholderService.calculateEngagementScore(id);
    return { stakeholderId: id, engagementScore: score };
  }

  // Bağlılık skoru güncelleme endpoint'i
  @Post(':id/update-engagement')
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'Stakeholder'),
  )
  @ApiOperation({
    summary: 'Bir paydaşın bağlılık skorunu hesapla ve güncelle',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bağlılık skoru başarıyla hesaplandı ve kaydedildi.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paydaş bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  updateEngagement(@Param('id') id: string) {
    return this.stakeholderService.updateEngagementScore(id);
  }

  /**
   * Query parametrelerinde en az bir filtre olup olmadığını kontrol eder
   */
  private hasFilters(filterDto: FilterStakeholdersQueryDto): boolean {
    return !!(
      filterDto.type ||
      filterDto.tagIds ||
      filterDto.minDonationAmount ||
      filterDto.maxDonationAmount ||
      filterDto.lastDonationStart ||
      filterDto.lastDonationEnd ||
      filterDto.locationKeyword ||
      filterDto.customFieldName
    );
  }

  /**
   * Query parametrelerini segmentasyon DTO formatına dönüştürür
   */
  private mapToSegmentationFilters(
    query: FilterStakeholdersQueryDto,
  ): FindSegmentedStakeholdersDto {
    const filters: FindSegmentedStakeholdersDto = {
      page: query.page,
      limit: query.limit,
    };

    // Temel filtreler
    if (query.type) {
      filters.type = query.type;
    }

    if (query.locationKeyword) {
      filters.locationKeyword = query.locationKeyword;
    }

    // Etiketleri virgülle ayrılmış listeden diziye dönüştür
    if (query.tagIds) {
      filters.tagIds = query.tagIds.split(',').map((tag) => tag.trim());
    }

    // Bağış miktarı aralığı
    if (query.minDonationAmount || query.maxDonationAmount) {
      filters.totalDonationAmount = {};

      if (query.minDonationAmount) {
        filters.totalDonationAmount.min = query.minDonationAmount;
      }

      if (query.maxDonationAmount) {
        filters.totalDonationAmount.max = query.maxDonationAmount;
      }
    }

    // Bağış tarih aralığı
    if (query.lastDonationStart || query.lastDonationEnd) {
      filters.lastDonationDate = {};

      if (query.lastDonationStart) {
        filters.lastDonationDate.start = query.lastDonationStart;
      }

      if (query.lastDonationEnd) {
        filters.lastDonationDate.end = query.lastDonationEnd;
      }
    }

    // Özel alan filtresi
    if (query.customFieldName && query.customFieldValue) {
      filters.customFields = [
        {
          fieldName: query.customFieldName,
          value: query.customFieldValue,
        },
      ];
    }

    return filters;
  }
}
