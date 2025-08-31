import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { AidRequestsService } from './aid-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { UpdateAidRequestDto } from './dto/update-aid-request.dto';
import {
  CurrentUser,
  PaginationDto,
  ApiGetOne,
  ApiCreateOne,
  ApiUpdateOne,
  ApiDeleteOne,
  ApiGetPaginated,
} from '../../common';
import { AidRequestEntity } from './entities/aid-request.entity';

@ApiTags('aidrequests')
@Controller('aidrequests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AidRequestsController {
  constructor(private readonly aidRequestsService: AidRequestsService) {}

  @ApiGetPaginated(AidRequestEntity, 'aid requests')
  @Get()
  async getPaginated(@Query() query: PaginationDto) {
    return this.aidRequestsService.getPaginated(
      query.page,
      query.limit,
      query.search,
    );
  }

  @ApiCreateOne(AidRequestEntity, 'Yeni yardım talebi oluşturur')
  @Post()
  async create(
    @Body() createAidRequestDto: CreateAidRequestDto,
    @CurrentUser('id') userId: number,
  ) {
    const aidRequestData = { ...createAidRequestDto, userId };
    return this.aidRequestsService.create(aidRequestData);
  }

  @ApiGetOne(AidRequestEntity, 'Belirli bir yardım talebini getirir')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.aidRequestsService.findOne(+id);
  }

  @ApiUpdateOne(AidRequestEntity, 'Yardım talebini günceller')
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateAidRequestDto: UpdateAidRequestDto,
  ) {
    return this.aidRequestsService.update(+id, updateAidRequestDto);
  }

  @ApiDeleteOne('Yardım talebini siler')
  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.aidRequestsService.delete(+id);
    return { message: 'Yardım talebi başarıyla silindi' };
  }

  // Yardım koduna göre arama
  @ApiGetOne(AidRequestEntity, 'Yardım koduna göre talep getirir')
  @Get('help-code/:code')
  async findByHelpCode(@Param('code') code: string) {
    return this.aidRequestsService.findByHelpCode(code);
  }

  // Yorum ekleme
  @Post(':id/comments')
  async addComment(@Param('id') id: number, @Body() body: { content: string }) {
    return this.aidRequestsService.addComment(+id, body.content);
  }

  // Tekrarlayan talep olarak işaretle
  @ApiUpdateOne(
    AidRequestEntity,
    'Yardım talebini tekrarlayan olarak işaretler',
  )
  @Put(':id/recurring')
  async markAsRecurring(@Param('id') id: number) {
    return this.aidRequestsService.markAsRecurring(+id);
  }

  // Tekrarlayan talep işaretini kaldır
  @ApiUpdateOne(
    AidRequestEntity,
    'Yardım talebinin tekrarlayan işaretini kaldırır',
  )
  @Delete(':id/recurring')
  async unmarkAsRecurring(@Param('id') id: number) {
    return this.aidRequestsService.unmarkAsRecurring(+id);
  }

  // Kullanıcının tekrarlayan taleplerini getir
  @ApiGetPaginated(AidRequestEntity, 'user recurring requests')
  @Get('recurring/my')
  async getMyRecurringRequests(@CurrentUser('id') userId: number) {
    return this.aidRequestsService.getUserRecurringRequests(userId);
  }

  // Tüm tekrarlayan talepleri getir (admin için)
  @ApiGetPaginated(AidRequestEntity, 'all recurring requests')
  @Get('recurring/all')
  async getAllRecurringRequests() {
    return this.aidRequestsService.getAllRecurringRequests();
  }
}
