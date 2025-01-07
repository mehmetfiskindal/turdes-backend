import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('HistoryService', () => {
  let service: HistoryService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            organization: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRequestHistory', () => {
    it('should return user request history', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 1,
        name: 'Test User',
        aidRequests: [{ id: 1, type: 'Food', description: 'Need food' }],
      } as any);

      const result = await service.getUserRequestHistory(1);
      expect(result).toEqual([
        { id: 1, type: 'Food', description: 'Need food' },
      ]);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getUserRequestHistory(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOrganizationRequestHistory', () => {
    it('should return organization request history', async () => {
      const mockOrganization = {
        id: 1,
        name: 'Test Organization',
        type: 'Non-Profit',
        mission: 'Helping people',
        createdAt: new Date(),
        updatedAt: new Date(),
        contactInfoId: 1,
        addressId: 1,
        aidRequest: [{ id: 1, type: 'Food', description: 'Need food' }],
      };
      jest
        .spyOn(prismaService.organization, 'findUnique')
        .mockResolvedValue(mockOrganization);

      const result = await service.getOrganizationRequestHistory(1);
      expect(result).toEqual(mockOrganization.aidRequest);
    });

    it('should throw NotFoundException if organization is not found', async () => {
      jest
        .spyOn(prismaService.organization, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.getOrganizationRequestHistory(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
