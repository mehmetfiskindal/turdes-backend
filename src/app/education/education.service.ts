import { Injectable } from '@nestjs/common';
import { UploadTrainingDto } from './dto/upload-training.dto';

@Injectable()
export class EducationService {
  private readonly trainingMaterials = [];

  uploadTraining(uploadTrainingDto: UploadTrainingDto) {
    const newTrainingMaterial = {
      id: this.trainingMaterials.length + 1,
      ...uploadTrainingDto,
    };
    this.trainingMaterials.push(newTrainingMaterial);
    return newTrainingMaterial;
  }

  getAllTrainingMaterials() {
    return this.trainingMaterials;
  }
}
