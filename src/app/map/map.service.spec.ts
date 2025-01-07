import { Test, TestingModule } from '@nestjs/testing';
import { MapService } from './map.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MapService', () => {
  let service: MapService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapService,
        {
          provide: PrismaService,
          useValue: {
            aidRequest: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MapService>(MapService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAidRequests', () => {
    it('should return an array of aid requests', async () => {
      const result = [{ id: 1, type: 'Food', description: 'Need food', userId: 1, organizationId: 1, status: 'Pending', isDeleted: false, locationId: 1 }];
      jest.spyOn(prismaService.aidRequest, 'findMany').mockResolvedValue(result);

      expect(await service.getAidRequests(40.7128, -74.0060)).toBe(result);
    });

    it('should throw a NotFoundException if no aid requests are found', async () => {
      jest.spyOn(prismaService.aidRequest, 'findMany').mockResolvedValue([]);

      await expect(service.getAidRequests(40.7128, -74.0060)).rejects.toThrow(NotFoundException);
    });
  });
});
