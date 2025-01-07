import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: {
            aidRequest: {
              findMany: jest.fn(),
            },
            donation: {
              findMany: jest.fn(),
            },
            volunteer: {
              findMany: jest.fn(),
            },
            donor: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAidDistributionReport', () => {
    it('should generate aid distribution report', async () => {
      jest.spyOn(prismaService.aidRequest, 'findMany').mockResolvedValue([
        {
          id: 1,
          type: 'Food',
          description: 'Need food',
          status: 'Pending',
          user: { name: 'User1' },
          organization: { name: 'Org1' },
        } as any,
      ]);

      const result = await service.generateAidDistributionReport(
        '2023-01-01',
        '2023-12-31',
      );
      expect(result).toEqual([
        {
          id: 1,
          type: 'Food',
          description: 'Need food',
          status: 'Pending',
          user: 'User1',
          organization: 'Org1',
        },
      ]);
    });
  });

  describe('generateDonationDistributionReport', () => {
    it('should generate donation distribution report', async () => {
      jest.spyOn(prismaService.donation, 'findMany').mockResolvedValue([
        {
          id: 1,
          amount: 100,
          donor: { name: 'Donor1' },
          donorId: 1,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        } as any,
      ]);

      const result = await service.generateDonationDistributionReport(
        '2023-01-01',
        '2023-12-31',
      );
      expect(result).toEqual([
        {
          id: 1,
          amount: 100,
          donor: 'Donor1',
          createdAt: new Date('2023-01-01'),
        },
      ]);
    });
  });

  describe('generateVolunteerActivityReport', () => {
    it('should generate volunteer activity report', async () => {
      jest.spyOn(prismaService.volunteer, 'findMany').mockResolvedValue([
        {
          id: 1,
          name: 'Volunteer1',
          email: 'volunteer1@example.com',
          phone: '1234567890',
          tasks: 'Task1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        } as any,
      ]);

      const result = await service.generateVolunteerActivityReport(
        '2023-01-01',
        '2023-12-31',
      );
      expect(result).toEqual([
        {
          id: 1,
          name: 'Volunteer1',
          email: 'volunteer1@example.com',
          phone: '1234567890',
          tasks: 'Task1',
          createdAt: new Date('2023-01-01'),
        },
      ]);
    });
  });

  describe('generateDonorActivityReport', () => {
    it('should generate donor activity report', async () => {
      jest.spyOn(prismaService.donor, 'findMany').mockResolvedValue([
        {
          id: 1,
          name: 'Donor1',
          email: 'donor1@example.com',
          phone: '1234567890',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        } as any,
      ]);

      const result = await service.generateDonorActivityReport(
        '2023-01-01',
        '2023-12-31',
      );
      expect(result).toEqual([
        {
          id: 1,
          name: 'Donor1',
          email: 'donor1@example.com',
          phone: '1234567890',
          createdAt: new Date('2023-01-01'),
        },
      ]);
    });
  });
});
