import { Test, TestingModule } from '@nestjs/testing';
import { AidRequestsService } from './aid-requests.service';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';

// QRCode mock
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
}));

describe('AidRequestsService', () => {
  let service: AidRequestsService;
  let prismaService: PrismaService;
  // firebaseAdminService currently not directly asserted in tests

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

    service = module.get<AidRequestsService>(AidRequestsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.spyOn(prismaService.organization, 'findUnique').mockResolvedValue({
      id: 1,
      name: 'Test Organization',
      type: 'Non-Profit',
      mission: 'Helping people',
      contactInfoId: 1,
      addressId: 1,
      rating: 0,
      feedback: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addComment', () => {
    it('should add a comment to a specific aid request', async () => {
      // Aid request existence mock
      jest.spyOn(prismaService.aidRequest, 'findUnique').mockResolvedValue({
        id: 1,
        type: 'Food',
        description: 'Need food',
        userId: 1,
        organizationId: 1,
        status: 'Pending',
        isDeleted: false,
        locationId: 1,
        qrCodeUrl: '',
        isUrgent: false,
        recurring: false,
        verified: false,
        reported: false,
        helpCode: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      const result = {
        id: 1,
        content: 'This is a comment',
        aidRequestId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.comment, 'create').mockResolvedValue(result);

      expect(await service.addComment(1, 'This is a comment')).toBe(result);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document to a specific aid request', async () => {
      // Aid request existence mock
      jest.spyOn(prismaService.aidRequest, 'findUnique').mockResolvedValue({
        id: 1,
        type: 'Food',
        description: 'Need food',
        userId: 1,
        organizationId: 1,
        status: 'Pending',
        isDeleted: false,
        locationId: 1,
        qrCodeUrl: '',
        isUrgent: false,
        recurring: false,
        verified: false,
        reported: false,
        helpCode: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      const result = {
        id: 1,
        name: 'Document',
        url: 'http://example.com',
        aidRequestId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.document, 'create').mockResolvedValue(result);

      expect(
        await service.uploadDocument(1, 'Document', 'http://example.com'),
      ).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of aid requests', async () => {
      const result = [
        {
          id: 1,
          type: 'Food',
          description: 'Need food',
          userId: 1,
          organizationId: 1,
          status: 'Pending',
          isDeleted: false,
          locationId: 1,
          qrCodeUrl: '',
          isUrgent: false,
          recurring: false,
          verified: false,
          reported: false,
          helpCode: '',
        },
      ];
      jest
        .spyOn(prismaService.aidRequest, 'findMany')
        .mockResolvedValue(result);

      expect(await service.findAllByUser(1)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a specific aid request', async () => {
      const result = {
        id: 1,
        type: 'Food',
        description: 'Need food',
        userId: 1,
        organizationId: 1,
        isDeleted: false,
        status: 'Pending',
        locationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCodeUrl: '',
        isUrgent: false,
        recurring: false,
        verified: false,
        reported: false,
        helpCode: '',
      };
      jest
        .spyOn(prismaService.aidRequest, 'findUnique')
        .mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
    });

    it('should throw NotFoundException if aid request not found', async () => {
      jest
        .spyOn(prismaService.aidRequest, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'yardım talebi bulunamadı',
      );
    });
  });

  describe('create', () => {
    it('should create a new aid request', async () => {
      const createAidRequestDto = {
        type: 'Food',
        description: 'Need food',
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
        type: createAidRequestDto.type,
        description: createAidRequestDto.description,
        status: createAidRequestDto.status,
        userId: 1,
        organizationId: 1,
        isDeleted: false,
        locationId: location.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCodeUrl: '',
        isUrgent: false,
        recurring: false,
        verified: false,
        reported: false,
        helpCode: '',
      } as any;
      jest.spyOn(prismaService.location, 'create').mockResolvedValue(location);
      jest
        .spyOn(prismaService.aidRequest, 'create')
        .mockResolvedValue(createdAidRequest);

      // Mock QRCode generation
      const mockQRCodeUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
      (QRCode.toDataURL as jest.Mock).mockResolvedValue(mockQRCodeUrl);

      // Mock update call invoked after QR generation
      jest
        .spyOn(prismaService.aidRequest, 'update')
        .mockResolvedValue({ ...createdAidRequest, qrCodeUrl: mockQRCodeUrl });

      const createAidRequestDtoWithUser = { ...createAidRequestDto, userId: 1 };
      const created = await service.create(createAidRequestDtoWithUser);
      expect(created).toMatchObject({
        id: 1,
        type: 'Food',
        description: 'Need food',
        status: 'Pending',
      });

      // QR code generation happens asynchronously after create
      expect(QRCode.toDataURL).toHaveBeenCalledWith('aid-request:1');
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { qrCodeUrl: mockQRCodeUrl },
      });
    });

    it('should handle creation failure', async () => {
      const createAidRequestDto = {
        type: 'Food',
        description: 'Need food',
        status: 'Pending',
        userId: 1,
        organizationId: 999,
        locationId: 1,
        isDeleted: false,
        latitude: 40.7128,
        longitude: -74.006,
        recurring: false,
      };

      jest
        .spyOn(prismaService.aidRequest, 'create')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.create(createAidRequestDto)).rejects.toThrow(Error);
    });
  });

  describe('delete', () => {
    it('should delete a specific aid request', async () => {
      const aidRequest = {
        id: 1,
        isDeleted: false,
        userId: 1,
        organizationId: 1,
        type: 'Food',
        description: 'Need food',
        status: 'Pending',
        locationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCodeUrl: '',
        isUrgent: false,
        recurring: false,
        verified: false,
        reported: false,
        helpCode: '',
      };

      // Mock findOne to return the aid request
      jest
        .spyOn(prismaService.aidRequest, 'findUnique')
        .mockResolvedValue(aidRequest as any);

      // Mock update call for soft delete
      jest
        .spyOn(prismaService.aidRequest, 'update')
        .mockResolvedValue({ ...aidRequest, isDeleted: true } as any);

      // delete method returns void, not the deleted object
      await expect(service.delete(1)).resolves.toBeUndefined();
    });
  });
});
