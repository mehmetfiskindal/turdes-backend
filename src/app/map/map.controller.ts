import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MapService } from './map.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../casl/action';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('aid-centers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ description: 'Harita bölgesindeki yardım merkezleri' })
  @ApiQuery({ name: 'north', type: Number, required: true })
  @ApiQuery({ name: 'south', type: Number, required: true })
  @ApiQuery({ name: 'east', type: Number, required: true })
  @ApiQuery({ name: 'west', type: Number, required: true })
  async getAidCenters(
    @Query('north') north: number,
    @Query('south') south: number,
    @Query('east') east: number,
    @Query('west') west: number,
  ) {
    // String olarak gelen değerleri sayıya çevirme
    const bounds = {
      north: parseFloat(north as any),
      south: parseFloat(south as any),
      east: parseFloat(east as any),
      west: parseFloat(west as any),
    };

    const aidCenters = await this.mapService.getActiveAidCenters(bounds);

    return {
      success: true,
      data: aidCenters,
    };
  }

  @Get('aid-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    description: 'Harita bölgesindeki yardım talepleri - rol bazlı erişim',
  })
  async getAidRequests(@Req() req) {
    console.log('Kullanıcı bilgisi:', req.user);
    // JWT stratejisinden gelen kullanıcı ID'sini doğru şekilde alalım
    const userId = req.user.id;
    const userRole = req.user.role;

    // Kullanıcının rolüne göre yardım taleplerini filtrele
    const aidRequests = await this.mapService.getAidRequestsForMap(
      userId,
      userRole,
    );

    return {
      success: true,
      data: aidRequests,
    };
  }

  @Post('aid-location')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ description: 'Yardım talebine konum ekler' })
  @ApiBody({
    description: 'Yardım kodunu ve konum bilgilerini içeren veri',
    schema: {
      type: 'object',
      properties: {
        helpCode: { type: 'string', example: 'a1b2c3d4e5' },
        latitude: { type: 'number', example: 41.0082 },
        longitude: { type: 'number', example: 28.9784 },
      },
      required: ['helpCode', 'latitude', 'longitude'],
    },
  })
  async addLocationToAidRequest(
    @Body()
    locationData: {
      helpCode: string;
      latitude: number;
      longitude: number;
    },
  ) {
    const { helpCode, latitude, longitude } = locationData;

    const updatedAidRequest = await this.mapService.addLocationWithHelpCode(
      helpCode,
      latitude,
      longitude,
    );

    return {
      success: true,
      data: updatedAidRequest,
    };
  }

  @Get('tasks')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin, Role.OrganizationOwner)
  @ApiResponse({ description: 'Harita bölgesindeki görevler' })
  @ApiQuery({ name: 'north', type: Number, required: true })
  @ApiQuery({ name: 'south', type: Number, required: true })
  @ApiQuery({ name: 'east', type: Number, required: true })
  @ApiQuery({ name: 'west', type: Number, required: true })
  async getTasks(
    @Query('north') north: number,
    @Query('south') south: number,
    @Query('east') east: number,
    @Query('west') west: number,
  ) {
    // String olarak gelen değerleri sayıya çevirme
    const bounds = {
      north: parseFloat(north as any),
      south: parseFloat(south as any),
      east: parseFloat(east as any),
      west: parseFloat(west as any),
    };

    const tasks = await this.mapService.getTasksForMap(bounds);

    return {
      success: true,
      data: tasks,
    };
  }
}
