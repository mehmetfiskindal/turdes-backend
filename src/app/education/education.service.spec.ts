import { Test, TestingModule } from '@nestjs/testing';
import { EducationService } from './education.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadTrainingDto } from './dto/upload-training.dto';

describe('EducationService', () => {
  let service: EducationService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EducationService,
        {
          provide: PrismaService,
          useValue: {
            trainingMaterial: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EducationService>(EducationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadTraining', () => {
    it('should upload a training material', async () => {
      const uploadTrainingDto: UploadTrainingDto = {
        title: 'Training Title',
        description: 'Training Description',
        fileUrl: 'http://example.com/training.mp4',
        type: 'video',
        url: 'http://example.com/training.mp4',
      };
      const result = { id: 1, ...uploadTrainingDto, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.trainingMaterial, 'create').mockResolvedValue(result);

      expect(await service.uploadTraining(uploadTrainingDto)).toBe(result);
    });
  });

  describe('getAllTrainingMaterials', () => {
    it('should return an array of training materials', async () => {
      const result = [
        {
          id: 1,
          title: 'Training Title',
          description: 'Training Description',
          fileUrl: 'http://example.com/training.mp4',
          type: 'video',
          url: 'http://example.com/training.mp4',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(prismaService.trainingMaterial, 'findMany').mockResolvedValue(result);

      expect(await service.getAllTrainingMaterials()).toBe(result);
    });
  });
});
