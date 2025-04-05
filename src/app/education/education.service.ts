import { Injectable } from '@nestjs/common';
import { UploadTrainingDto } from './dto/upload-training.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadTraining(uploadTrainingDto: UploadTrainingDto) {
    return this.prisma.trainingMaterial.create({
      data: {
        title: uploadTrainingDto.title,
        url: uploadTrainingDto.url || uploadTrainingDto.fileUrl, // url alanını fileUrl'den alıyoruz, eğer url boşsa
      },
    });
  }

  async getAllTrainingMaterials() {
    return this.prisma.trainingMaterial.findMany();
  }
}
