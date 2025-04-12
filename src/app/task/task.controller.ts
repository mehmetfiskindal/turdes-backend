import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FindTasksDto } from './dto/find-tasks.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Task } from '@prisma/client';
import { Role } from '../casl/action';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni görev oluştur' })
  @ApiResponse({ status: 201, description: 'Görev başarıyla oluşturuldu.' })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm görevleri listele veya filtrele' })
  @ApiResponse({ status: 200, description: 'Görevler başarıyla listelendi.' })
  async findAll(
    @Query() filters: FindTasksDto,
    @Request() req,
  ): Promise<Task[]> {
    // Rol kontrolü - yöneticiler ve müdürler tüm görevleri görebilir,
    // normal kullanıcılar yalnızca kendilerine atanan görevleri görebilir
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      return filters && Object.keys(filters).length > 0
        ? this.taskService.findWithFilters(filters)
        : this.taskService.findAll();
    } else {
      // Normal kullanıcılar yalnızca kendilerine atanan görevleri görebilir
      return this.taskService.findByAssignedUser(req.user.id);
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: "ID'ye göre görev getir" })
  @ApiResponse({ status: 200, description: 'Görev başarıyla bulundu.' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı.' })
  async findOne(@Param('id') id: string, @Request() req): Promise<Task> {
    const task = await this.taskService.findOne(id);

    // Normal kullanıcılar yalnızca kendilerine atanan görevi görebilir
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'manager' &&
      task.assignedUserId !== req.user.id
    ) {
      throw new Error('Bu görevi görüntüleme yetkiniz bulunmuyor');
    }

    return task;
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Görevi güncelle' })
  @ApiResponse({ status: 200, description: 'Görev başarıyla güncellendi.' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı.' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Görevi sil' })
  @ApiResponse({ status: 200, description: 'Görev başarıyla silindi.' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı.' })
  async remove(@Param('id') id: string): Promise<Task> {
    return this.taskService.remove(id);
  }

  @Get('stakeholder/:stakeholderId')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Paydaşa göre görevleri listele' })
  @ApiResponse({ status: 200, description: 'Görevler başarıyla listelendi.' })
  async findByStakeholder(
    @Param('stakeholderId') stakeholderId: string,
  ): Promise<Task[]> {
    return this.taskService.findByStakeholder(stakeholderId);
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcıya atanmış görevleri listele' })
  @ApiResponse({ status: 200, description: 'Görevler başarıyla listelendi.' })
  async findByUser(
    @Param('userId') userId: string,
    @Request() req,
  ): Promise<Task[]> {
    // Rol kontrolü - yöneticiler ve müdürler herhangi bir kullanıcının görevlerini görebilir,
    // normal kullanıcılar yalnızca kendi görevlerini görebilir
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'manager' &&
      parseInt(userId) !== req.user.id
    ) {
      throw new Error(
        'Bu kullanıcının görevlerini görüntüleme yetkiniz bulunmuyor',
      );
    }

    return this.taskService.findByAssignedUser(parseInt(userId));
  }

  @Get('status/:status')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duruma göre görevleri listele' })
  @ApiResponse({ status: 200, description: 'Görevler başarıyla listelendi.' })
  async findByStatus(@Param('status') status: any): Promise<Task[]> {
    return this.taskService.findByStatus(status);
  }
}
