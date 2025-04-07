import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

@Injectable()
export class VolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(createVolunteerDto: CreateVolunteerDto) {
    // E-posta adresi ile kayıtlı gönüllü var mı kontrol et
    if (createVolunteerDto.email) {
      const existingVolunteer = await this.prisma.volunteer.findFirst({
        where: { email: createVolunteerDto.email },
      });

      if (existingVolunteer) {
        throw new BadRequestException(
          `Bu e-posta adresi (${createVolunteerDto.email}) ile kayıtlı bir gönüllü zaten mevcut`,
        );
      }
    }

    try {
      return await this.prisma.volunteer.create({
        data: createVolunteerDto,
      });
    } catch (error) {
      throw new BadRequestException(
        `Gönüllü kaydı sırasında bir hata oluştu: ${error.message}`,
      );
    }
  }

  async assignTask(assignTaskDto: AssignTaskDto) {
    // Gönüllünün varlığını kontrol et
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: assignTaskDto.volunteerId },
    });

    if (!volunteer) {
      throw new NotFoundException(
        `${assignTaskDto.volunteerId} ID'li gönüllü bulunamadı`,
      );
    }

    // Görevin varlığını kontrol et
    const task = await this.prisma.task.findUnique({
      where: { id: assignTaskDto.taskId },
    });

    if (!task) {
      throw new NotFoundException(
        `${assignTaskDto.taskId} ID'li görev bulunamadı`,
      );
    }

    // Görev zaten atanmış mı kontrol et
    const existingAssignment = await this.prisma.taskAssignment.findFirst({
      where: {
        volunteerId: assignTaskDto.volunteerId,
        taskId: assignTaskDto.taskId,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `Bu görev zaten bu gönüllüye atanmış durumda`,
      );
    }

    try {
      return await this.prisma.taskAssignment.create({
        data: {
          volunteerId: assignTaskDto.volunteerId,
          taskId: assignTaskDto.taskId,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Görev atama sırasında bir hata oluştu: ${error.message}`,
      );
    }
  }
}
