import { Test, TestingModule } from '@nestjs/testing';
import { AidRequestsService } from '../../src/app/aid-requests/aid-requests.service';
import { PrismaService } from '../../src/app/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import * as QRCode from 'qrcode';

describe('AidRequestsService - Integration Tests', () => {
  let app: INestApplication;
  let service: AidRequestsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AidRequestsService,
        {
          provide: PrismaService,
          useValue: {
            aidRequest: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            comment: {
              create: jest.fn(),
            },
            document: {
              create: jest.fn(),
            },
            location: {
              create: jest.fn(),
            },
            organization: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    service = module.get<AidRequestsService>(AidRequestsService);
    prismaService = module.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('QR Code Integration', () => {
    it('should generate real QR code during aid request creation', async () => {
      const createAidRequestDto = {
        type: 'Food',
        description: 'Need food urgently',
        status: 'Pending',
        userId: 1,
        organizationId: 1,
        locationId: 1,
        isDeleted: false,
        latitude: 40.7128,
        longitude: -74.006,
        recurring: false,
      };

      const location = { id: 1, latitude: 40.7128, longitude: -74.006 };
      const createdAidRequest = {
        id: 1,
        ...createAidRequestDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCodeUrl: '',
        isUrgent: false,
        verified: false,
        reported: false,
        helpCode: 'HELP001',
      };

      // Mock Prisma responses
      jest.spyOn(prismaService.location, 'create').mockResolvedValue(location);
      jest
        .spyOn(prismaService.aidRequest, 'create')
        .mockResolvedValue(createdAidRequest as any);

      // Mock QR code update
      const mockQRCodeData =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
      jest.spyOn(prismaService.aidRequest, 'update').mockResolvedValue({
        ...createdAidRequest,
        qrCodeUrl: mockQRCodeData,
      } as any);

      // Test real QR code generation (without mocking QRCode library)
      const result = await service.create(createAidRequestDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.type).toBe('Food');

      // Verify QR code generation was attempted
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            qrCodeUrl: expect.any(String),
          }),
        }),
      );
    });

    it('should handle QR code generation errors gracefully', async () => {
      // Mock QRCode.toDataURL to throw an error
      jest
        .spyOn(QRCode, 'toDataURL')
        .mockRejectedValue(new Error('QR generation failed'));

      const createAidRequestDto = {
        type: 'Medical',
        description: 'Medical emergency',
        status: 'Pending',
        userId: 2,
        organizationId: 1,
        locationId: 1,
        isDeleted: false,
        latitude: 41.0082,
        longitude: 28.9784,
        recurring: false,
      };

      const location = { id: 1, latitude: 41.0082, longitude: 28.9784 };
      const createdAidRequest = {
        id: 2,
        ...createAidRequestDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCodeUrl: '',
        isUrgent: false,
        verified: false,
        reported: false,
        helpCode: 'HELP002',
      };

      jest.spyOn(prismaService.location, 'create').mockResolvedValue(location);
      jest
        .spyOn(prismaService.aidRequest, 'create')
        .mockResolvedValue(createdAidRequest as any);

      // Even if QR generation fails, aid request creation should succeed
      const result = await service.create(createAidRequestDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(2);
      expect(result.type).toBe('Medical');

      // QR generation error should not prevent aid request creation
      expect(result).toEqual(createdAidRequest);
    });
  });

  describe('Recurring Requests Integration', () => {
    it('should handle recurring request operations', async () => {
      const mockAidRequest = {
        id: 1,
        type: 'Food',
        description: 'Weekly food assistance',
        userId: 1,
        organizationId: 1,
        status: 'Active',
        isDeleted: false,
        locationId: 1,
        recurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCodeUrl: '',
        isUrgent: false,
        verified: true,
        reported: false,
        helpCode: 'HELP001',
      };

      // Test marking as recurring
      jest
        .spyOn(prismaService.aidRequest, 'findUnique')
        .mockResolvedValue(mockAidRequest as any);
      jest
        .spyOn(prismaService.aidRequest, 'update')
        .mockResolvedValue({ ...mockAidRequest, recurring: true } as any);

      const recurringRequest = await service.markAsRecurring(1);
      expect(recurringRequest.recurring).toBe(true);

      // Test getting user's recurring requests
      jest
        .spyOn(prismaService.aidRequest, 'findMany')
        .mockResolvedValue([{ ...mockAidRequest, recurring: true }] as any);

      const userRecurringRequests = await service.getUserRecurringRequests(1);
      expect(userRecurringRequests).toHaveLength(1);
      expect(userRecurringRequests[0].recurring).toBe(true);
    });
  });
});
