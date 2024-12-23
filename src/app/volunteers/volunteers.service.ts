import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

@Injectable()
export class VolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(createVolunteerDto: CreateVolunteerDto) {
    return this.prisma.volunteer.create({
      data: createVolunteerDto,
    });
  }

  async assignTask(assignTaskDto: AssignTaskDto) {
    return this.prisma.taskAssignment.create({
      data: {
        volunteerId: assignTaskDto.volunteerId,
        taskId: assignTaskDto.taskId,
      },
    });
  }
}
