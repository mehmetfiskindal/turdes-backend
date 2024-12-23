import { Injectable } from '@nestjs/common';
import { UploadTrainingDto } from './dto/upload-training.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadTraining(uploadTrainingDto: UploadTrainingDto) {
    return this.prisma.trainingMaterial.create({
      data: uploadTrainingDto,
    });
  }

  async getAllTrainingMaterials() {
    return this.prisma.trainingMaterial.findMany();
  }
}
