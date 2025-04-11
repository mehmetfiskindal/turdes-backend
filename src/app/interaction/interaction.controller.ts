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
  Query,
  UseGuards,
} from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { Interaction } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { Action } from '../casl/action';
import { InteractionResponseDto } from './dto/interaction-response.dto';

@ApiTags('interaction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('interaction')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni etkileşim oluştur' })
  @ApiResponse({
    status: 201,
    description: 'Etkileşim başarıyla oluşturuldu',
    type: InteractionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz istek parametreleri' })
  @ApiResponse({ status: 401, description: 'Yetkilendirme hatası' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, 'Interaction'),
  )
  create(
    @Body() createInteractionDto: CreateInteractionDto,
  ): Promise<Interaction> {
    return this.interactionService.create(createInteractionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm etkileşimleri listele' })
  @ApiQuery({
    name: 'stakeholderId',
    description: 'Belirli bir paydaşın etkileşimlerini filtrelemek için ID',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Etkileşimler başarıyla listelendi',
    type: [InteractionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Yetkilendirme hatası' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Interaction'),
  )
  findAll(
    @Query('stakeholderId') stakeholderId?: string,
  ): Promise<Interaction[]> {
    if (stakeholderId) {
      return this.interactionService.findAllByStakeholder(stakeholderId);
    }
    return this.interactionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "ID'ye göre etkileşim getir" })
  @ApiParam({
    name: 'id',
    description: "Etkileşim ID'si",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Etkileşim başarıyla bulundu',
    type: InteractionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Yetkilendirme hatası' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 404, description: 'Etkileşim bulunamadı' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, 'Interaction'),
  )
  findOne(@Param('id') id: string): Promise<Interaction> {
    return this.interactionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Etkileşim güncelle' })
  @ApiParam({
    name: 'id',
    description: "Güncellenecek etkileşimin ID'si",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Etkileşim başarıyla güncellendi',
    type: InteractionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz istek parametreleri' })
  @ApiResponse({ status: 401, description: 'Yetkilendirme hatası' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 404, description: 'Etkileşim bulunamadı' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, 'Interaction'),
  )
  update(
    @Param('id') id: string,
    @Body() updateInteractionDto: UpdateInteractionDto,
  ): Promise<Interaction> {
    return this.interactionService.update(id, updateInteractionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Etkileşim sil' })
  @ApiParam({
    name: 'id',
    description: "Silinecek etkileşimin ID'si",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Etkileşim başarıyla silindi',
    type: InteractionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Yetkilendirme hatası' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 404, description: 'Etkileşim bulunamadı' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, 'Interaction'),
  )
  remove(@Param('id') id: string): Promise<Interaction> {
    return this.interactionService.remove(id);
  }
}
