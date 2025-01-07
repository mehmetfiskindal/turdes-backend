import { Test, TestingModule } from '@nestjs/testing';
import { DonorsService } from './donors.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonorDto } from './dto/create-donor.dto';

describe('DonorsService', () => {
  let service: DonorsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonorsService,
        {
          provide: PrismaService,
          useValue: {
            donor: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            donation: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DonorsService>(DonorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new donor', async () => {
      const createDonorDto: CreateDonorDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        donationHistory: [],
      };
      const result = {
        id: 1,
        ...createDonorDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.donor, 'create').mockResolvedValue(result);

      expect(await service.create(createDonorDto)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a specific donor', async () => {
      const result = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.donor, 'findUnique').mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
    });
  });

  describe('findDonations', () => {
    it('should return an array of donations for a specific donor', async () => {
      const result = [
        {
          id: 1,
          amount: 100,
          donorId: 1,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(prismaService.donation, 'findMany').mockResolvedValue(result);

      expect(await service.findDonations(1)).toBe(result);
    });
  });

  describe('findDonationHistory', () => {
    it('should return the donation history for a specific donor', async () => {
      const result = [
        {
          id: 1,
          amount: 100,
          donorId: 1,
          userId: 1,
          donor: { id: 1, name: 'John Doe' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(prismaService.donation, 'findMany').mockResolvedValue(result);

      expect(await service.findDonationHistory(1)).toBe(result);
    });
  });
});
