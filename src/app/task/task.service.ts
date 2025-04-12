import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FindTasksDto } from './dto/find-tasks.dto';
import { Task, TaskStatus } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: createTaskDto,
    });
  }

  async findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({
      include: {
        stakeholder: true,
        assignedUser: true,
      },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        stakeholder: true,
        assignedUser: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Görev #${id} bulunamadı`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Önce görevin varlığını kontrol et
    await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        stakeholder: true,
        assignedUser: true,
      },
    });
  }

  async remove(id: string): Promise<Task> {
    // Önce görevin varlığını kontrol et
    await this.findOne(id);

    return this.prisma.task.delete({
      where: { id },
      include: {
        stakeholder: true,
        assignedUser: true,
      },
    });
  }

  // Özel filtreleme metodları

  async findByStakeholder(stakeholderId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { stakeholderId },
      include: {
        stakeholder: true,
        assignedUser: true,
      },
    });
  }

  async findByAssignedUser(assignedUserId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { assignedUserId },
      include: {
        stakeholder: true,
        assignedUser: true,
      },
    });
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { status },
      include: {
        stakeholder: true,
        assignedUser: true,
      },
    });
  }

  async findWithFilters(filters: FindTasksDto): Promise<Task[]> {
    const query: any = {
      where: {},
      include: {
        stakeholder: true,
        assignedUser: true,
      },
    };

    // Filtreleri ekleyelim
    if (filters.status) {
      query.where.status = filters.status;
    }

    if (filters.priority) {
      query.where.priority = filters.priority;
    }

    if (filters.stakeholderId) {
      query.where.stakeholderId = filters.stakeholderId;
    }

    if (filters.assignedUserId) {
      query.where.assignedUserId = filters.assignedUserId;
    }

    return this.prisma.task.findMany(query);
  }
}
