import { Test, TestingModule } from '@nestjs/testing';
import { AidRequestsService } from './aid-requests.service';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AidRequestsService', () => {
  let service: AidRequestsService;
  let prismaService: PrismaService;
  let firebaseAdminService: FirebaseAdminService;

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
              create: jest.fn(),
              update: jest.fn(),
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
        {
          provide: FirebaseAdminService,
          useValue: {
            sendPushNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AidRequestsService>(AidRequestsService);
    prismaService = module.get<PrismaService>(PrismaService);
    firebaseAdminService = module.get<FirebaseAdminService>(FirebaseAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addComment', () => {
    it('should add a comment to a specific aid request', async () => {
      const result = { id: 1, content: 'This is a comment' };
      jest.spyOn(prismaService.comment, 'create').mockResolvedValue(result);

      expect(await service.addComment(1, 'This is a comment')).toBe(result);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document to a specific aid request', async () => {
      const result = { id: 1, documentName: 'Document', documentUrl: 'http://example.com' };
      jest.spyOn(prismaService.document, 'create').mockResolvedValue(result);

      expect(await service.uploadDocument(1, 'Document', 'http://example.com')).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of aid requests', async () => {
      const result = [{ id: 1, type: 'Food', description: 'Need food' }];
      jest.spyOn(prismaService.aidRequest, 'findMany').mockResolvedValue(result);

      expect(await service.findAll(1)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a specific aid request', async () => {
      const result = { id: 1, type: 'Food', description: 'Need food', userId: 1, organizationId: 1, isDeleted: false };
      jest.spyOn(prismaService.aidRequest, 'findUnique').mockResolvedValue(result);

      expect(await service.findOne(1, 1, 1)).toBe(result);
    });

    it('should throw an UnauthorizedException if the user does not have access', async () => {
      const result = { id: 1, type: 'Food', description: 'Need food', userId: 2, organizationId: 1, isDeleted: false };
      jest.spyOn(prismaService.aidRequest, 'findUnique').mockResolvedValue(result);

      await expect(service.findOne(1, 1, 1)).rejects.toThrow(UnauthorizedException);
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
        longitude: -74.0060,
      };
      const location = { id: 1, latitude: 40.7128, longitude: -74.0060 };
      const result = { id: 1, ...createAidRequestDto };
      jest.spyOn(prismaService.location, 'create').mockResolvedValue(location);
      jest.spyOn(prismaService.aidRequest, 'create').mockResolvedValue(result);

      expect(await service.create(createAidRequestDto, 1)).toBe(result);
    });

    it('should throw an error if the organization is not found', async () => {
      const createAidRequestDto = {
        type: 'Food',
        description: 'Need food',
        status: 'Pending',
        userId: 1,
        organizationId: 1,
        locationId: 1,
        isDeleted: false,
        latitude: 40.7128,
        longitude: -74.0060,
      };
      jest.spyOn(prismaService.organization, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createAidRequestDto, 1)).rejects.toThrow(Error);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a specific aid request', async () => {
      const result = { id: 1, status: 'Completed' };
      jest.spyOn(prismaService.aidRequest, 'update').mockResolvedValue(result);

      expect(await service.updateStatus(1, 'Completed', '1', 'admin')).toBe(result);
    });

    it('should throw an UnauthorizedException if the user is not an admin', async () => {
      await expect(service.updateStatus(1, 'Completed', '1', 'user')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('delete', () => {
    it('should delete a specific aid request', async () => {
      const result = { id: 1, isDeleted: true };
      jest.spyOn(prismaService.aidRequest, 'update').mockResolvedValue(result);

      expect(await service.delete(1)).toBe(result);
    });
  });
});
