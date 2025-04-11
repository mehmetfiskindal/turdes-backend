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
  UseGuards, // Ekle
  HttpStatus, // HttpStatus'u import et
} from '@nestjs/common';
import { StakeholderService } from './stakeholder.service';
import { CreateStakeholderDto } from './dto/create-stakeholder.dto';
import { UpdateStakeholderDto } from './dto/update-stakeholder.dto';
import { Stakeholder, Interaction } from '@prisma/client'; // Interaction'ı da import et
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation, // ApiOperation'ı import et
  ApiResponse, // ApiResponse'u import et
} from '@nestjs/swagger'; // Swagger için ekle
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // JWT Guard'ı import et
import { PoliciesGuard } from '../casl/policies.guard'; // Policies Guard'ı import et
import { CheckPolicies } from '../casl/check-policies.decorator'; // CheckPolicies'i import et
import { AppAbility } from '../casl/casl-ability.factory'; // AppAbility'yi import et
import { Action } from '../casl/action'; // Action'ı import et

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
  @ApiOperation({ summary: 'Tüm paydaşları listele' }) // Operasyon özeti
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paydaşlar başarıyla listelendi.',
    type: [CreateStakeholderDto], // Dizi olarak DTO'yu referans göster
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Yetkisiz erişim.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Erişim reddedildi.',
  })
  findAll(): Promise<Stakeholder[]> {
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
  getDetailedProfile(
    @Param('id') id: string,
  ): Promise<Stakeholder & { interactions: Interaction[] }> {
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
}
