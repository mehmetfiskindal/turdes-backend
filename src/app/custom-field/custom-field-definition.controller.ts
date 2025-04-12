import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CustomFieldDefinitionService } from './custom-field-definition.service';
import { CreateCustomFieldDefinitionDto } from './dto/create-custom-field-definition.dto';
import { UpdateCustomFieldDefinitionDto } from './dto/update-custom-field-definition.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../casl/action';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('custom-fields')
@Controller('custom-fields')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
@Roles(Role.Admin)
export class CustomFieldDefinitionController {
  constructor(
    private readonly customFieldDefinitionService: CustomFieldDefinitionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Yeni bir özel alan tanımı oluştur (Admin)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Özel alan tanımı başarıyla oluşturuldu.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz girdi parametreleri.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bu isimde bir alan zaten mevcut.',
  })
  create(
    @Body() createCustomFieldDefinitionDto: CreateCustomFieldDefinitionDto,
  ) {
    return this.customFieldDefinitionService.create(
      createCustomFieldDefinitionDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Tüm özel alan tanımlarını listele (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Özel alan tanımları başarıyla listelendi.',
  })
  findAll() {
    return this.customFieldDefinitionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile tek bir özel alan tanımı getir (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Özel alan tanımı başarıyla getirildi.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Özel alan tanımı bulunamadı.',
  })
  findOne(@Param('id') id: string) {
    return this.customFieldDefinitionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Özel alan tanımını güncelle (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Özel alan tanımı başarıyla güncellendi.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Özel alan tanımı bulunamadı.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bu isimde bir alan zaten mevcut.',
  })
  update(
    @Param('id') id: string,
    @Body() updateCustomFieldDefinitionDto: UpdateCustomFieldDefinitionDto,
  ) {
    return this.customFieldDefinitionService.update(
      id,
      updateCustomFieldDefinitionDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Özel alan tanımını sil (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Özel alan tanımı başarıyla silindi.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Özel alan tanımı bulunamadı.',
  })
  remove(@Param('id') id: string) {
    return this.customFieldDefinitionService.remove(id);
  }
}
