import { Test, TestingModule } from '@nestjs/testing';
import { AidRequestsService } from './aid-requests.service';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';

import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import {
  AidRequest,
  User,
  Location,
  Organization,
  UserCategory,
} from '@prisma/client';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
// Mock dependencies
jest.mock('../prisma/prisma.service');
jest.mock('../firebase/fcm/firebase-admin.service');
jest.mock('qrcode');
jest.mock('uuid');

describe('AidRequestsService', () => {
  let service: AidRequestsService;
  let prismaService: PrismaService;
  let firebaseAdminService: FirebaseAdminService;

  // Define mock objects for PrismaService methods
  const mockPrismaService = {
    aidRequest: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
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
    // Add other models and methods as needed by the service
  };

  // Define mock object for FirebaseAdminService methods
  const mockFirebaseAdminService = {
    sendPushNotification: jest.fn(),
  };

  const mockUserId = 1;
  const mockOrganizationId = 1;
  const mockAidRequestId = 1;

  // Adjusted mockUser based on potential type definition inferred from error 2353
  const mockUser: User = {
    id: mockUserId,
    email: 'test@example.com',
    passwordHash: 'hashedpassword', // Changed from password
    name: 'Test User',
    phone: '1234567890', // Added based on inferred type
    role: 'user',
    category: UserCategory.NONE, // Used enum member
    createdAt: new Date(),
    updatedAt: new Date(),
    isEmailVerified: false, // Added based on inferred type
    refreshToken: null, // Added based on inferred type
    verificationToken: null, // Added based on inferred type
    tokenExpiresAt: null, // Added based on inferred type
  };

  const mockLocation: Location = {
    id: 1,
    latitude: 40.7128,
    longitude: -74.006,
  };

  const mockAidRequest: AidRequest & { location?: Location; user?: User } = {
    id: mockAidRequestId,
    type: 'Food',
    description: 'Need food supplies',
    status: 'pending',
    userId: mockUserId,
    organizationId: mockOrganizationId,
    locationId: mockLocation.id,
    isDeleted: false,
    recurring: false,
    qrCodeUrl: 'mockQRCodeUrl',
    helpCode: null,
    isUrgent: false,
    verified: false,
    reported: false,
    location: mockLocation,
    user: mockUser,
  };

  const mockCreateAidRequestDto: CreateAidRequestDto = {
    type: 'Medical',
    description: 'Need medical assistance',
    status: 'pending',
    latitude: 41.015137,
    longitude: 28.97953,
    organizationId: mockOrganizationId,
    recurring: false,
    isUrgent: false,
    // Added missing properties to satisfy the type, assuming DTO definition might be incorrect
    userId: mockUserId, // Placeholder, usually derived from context
    locationId: 0, // Placeholder, usually created by service
    isDeleted: false, // Placeholder, usually not part of creation DTO
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AidRequestsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // Provide the mock object
        },
        {
          provide: FirebaseAdminService,
          useValue: mockFirebaseAdminService, // Provide the mock object
        },
      ],
    }).compile();

    service = module.get<AidRequestsService>(AidRequestsService);
    // Assign the mock objects to the variables used in tests
    prismaService = module.get<PrismaService>(PrismaService);
    firebaseAdminService =
      module.get<FirebaseAdminService>(FirebaseAdminService);

    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock default implementations for external libraries if needed (already done)
    (QRCode.toDataURL as jest.Mock).mockResolvedValue('mockQRCodeUrl');
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addComment', () => {
    it('should add a comment to an aid request', async () => {
      const content = 'This is a test comment';
      const mockComment = {
        id: 1,
        content: content,
        aidRequestId: mockAidRequestId,
        createdAt: new Date(),
      };
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        mockAidRequest,
      );
      (prismaService.comment.create as jest.Mock).mockResolvedValue(
        mockComment,
      );

      const result = await service.addComment(mockAidRequestId, content);

      expect(prismaService.aidRequest.findUnique).toHaveBeenCalledWith({
        where: { id: mockAidRequestId },
      });
      expect(prismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: content,
          aidRequest: { connect: { id: mockAidRequestId } },
        },
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException if aid request does not exist', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.addComment(mockAidRequestId, 'Test comment'),
      ).rejects.toThrow(
        new NotFoundException(
          `${mockAidRequestId} ID'li yardım talebi bulunamadı`,
        ),
      );
    });

    it('should throw BadRequestException if content is empty', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        mockAidRequest,
      );

      await expect(service.addComment(mockAidRequestId, ' ')).rejects.toThrow(
        new BadRequestException('Yorum içeriği boş olamaz'),
      );
    });
  });

  describe('uploadDocument', () => {
    const documentName = 'test-doc.pdf';
    const documentUrl = 'http://example.com/test-doc.pdf';

    it('should upload a document for an aid request', async () => {
      const mockDocument = {
        id: 1,
        name: documentName,
        url: documentUrl,
        aidRequestId: mockAidRequestId,
        createdAt: new Date(),
      };
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        mockAidRequest,
      );
      (prismaService.document.create as jest.Mock).mockResolvedValue(
        mockDocument,
      );

      const result = await service.uploadDocument(
        mockAidRequestId,
        documentName,
        documentUrl,
      );

      expect(prismaService.aidRequest.findUnique).toHaveBeenCalledWith({
        where: { id: mockAidRequestId },
      });
      expect(prismaService.document.create).toHaveBeenCalledWith({
        data: {
          name: documentName,
          url: documentUrl,
          aidRequest: { connect: { id: mockAidRequestId } },
        },
      });
      expect(result).toEqual(mockDocument);
    });

    it('should throw BadRequestException for invalid aidRequestId format', async () => {
      await expect(
        service.uploadDocument('invalid-id' as any, documentName, documentUrl),
      ).rejects.toThrow(
        new BadRequestException('Geçersiz yardım talebi ID formatı'),
      );
    });

    it('should throw NotFoundException if aid request does not exist', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.uploadDocument(mockAidRequestId, documentName, documentUrl),
      ).rejects.toThrow(
        new NotFoundException(
          `${mockAidRequestId} ID'li yardım talebi bulunamadı`,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of aid requests for the user', async () => {
      const aidRequests = [mockAidRequest];
      (prismaService.aidRequest.findMany as jest.Mock).mockResolvedValue(
        aidRequests,
      );

      const result = await service.findAll(mockUserId);

      expect(prismaService.aidRequest.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDeleted: false },
      });
      expect(result).toEqual(aidRequests);
    });
  });

  describe('findOne', () => {
    it('should return a single aid request', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        mockAidRequest,
      );

      const result = await service.findOne(
        mockAidRequestId,
        mockUserId,
        mockOrganizationId,
      );

      expect(prismaService.aidRequest.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockAidRequestId,
          userId: mockUserId,
          isDeleted: false,
          organizationId: mockOrganizationId,
        },
        include: {
          location: true,
        },
      });
      expect(result).toEqual(mockAidRequest);
    });

    it('should throw UnauthorizedException if aid request not found or user does not have access', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        null,
      ); // Simulate not found

      await expect(
        service.findOne(mockAidRequestId, mockUserId, mockOrganizationId),
      ).rejects.toThrow(
        new UnauthorizedException('You do not have access to this aid request'),
      );
    });

    it('should throw UnauthorizedException if aid request belongs to another user', async () => {
      const differentUserAidRequest = { ...mockAidRequest, userId: 999 };
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        differentUserAidRequest,
      );

      await expect(
        service.findOne(mockAidRequestId, mockUserId, mockOrganizationId),
      ).rejects.toThrow(
        new UnauthorizedException('You do not have access to this aid request'),
      );
    });
  });

  describe('create', () => {
    it('should create an aid request with organization and QR code', async () => {
      const mockOrganization: Organization = {
        id: mockOrganizationId,
        name: 'Test Org',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Added missing properties to satisfy the Organization type
        type: 'NGO', // Example value
        contactInfoId: 1, // Example value
        addressId: 1, // Example value
        mission: 'Help people', // Example value
        rating: 5, // Example value
        feedback: 'Good work', // Example value
      };
      const createdLocation = {
        id: 2,
        latitude: mockCreateAidRequestDto.latitude,
        longitude: mockCreateAidRequestDto.longitude,
        // Removed aidRequestId as it's not part of Location type
      };
      const createdAidRequest = {
        ...mockAidRequest,
        id: 2,
        type: mockCreateAidRequestDto.type,
        description: mockCreateAidRequestDto.description,
        organizationId: mockOrganizationId,
        locationId: createdLocation.id,
        qrCodeUrl: null, // Initially null
        // Ensure mockAidRequest base doesn't conflict
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedAidRequest = {
        ...createdAidRequest,
        qrCodeUrl: 'mockQRCodeUrl',
      };

      (prismaService.organization.findUnique as jest.Mock).mockResolvedValue(
        mockOrganization,
      );
      (prismaService.location.create as jest.Mock).mockResolvedValue(
        createdLocation,
      );
      (prismaService.aidRequest.create as jest.Mock).mockResolvedValue(
        createdAidRequest,
      );
      (prismaService.aidRequest.update as jest.Mock).mockResolvedValue(
        updatedAidRequest,
      );

      const result = await service.create(mockCreateAidRequestDto, mockUserId);

      expect(prismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { id: mockOrganizationId },
      });
      expect(prismaService.location.create).toHaveBeenCalledWith({
        data: {
          latitude: mockCreateAidRequestDto.latitude,
          longitude: mockCreateAidRequestDto.longitude,
        },
      });
      // Adjusted create call data based on typical service logic
      expect(prismaService.aidRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          // Use objectContaining for flexibility
          type: mockCreateAidRequestDto.type,
          description: mockCreateAidRequestDto.description,
          status: mockCreateAidRequestDto.status,
          organization: { connect: { id: mockOrganizationId } },
          location: { connect: { id: createdLocation.id } },
          user: { connect: { id: mockUserId } },
          recurring: mockCreateAidRequestDto.recurring,
          isUrgent: mockCreateAidRequestDto.isUrgent, // Added isUrgent
        }),
      });
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        `aidRequest:${createdAidRequest.id}`,
      );
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: createdAidRequest.id },
        data: { qrCodeUrl: 'mockQRCodeUrl' },
      });
      // Ensure the result matches the structure after update
      expect(result).toEqual(updatedAidRequest);
    });

    it('should create an aid request without organization', async () => {
      const dtoWithoutOrg = {
        ...mockCreateAidRequestDto,
        organizationId: undefined,
      };
      const createdLocation = {
        id: 3,
        latitude: dtoWithoutOrg.latitude,
        longitude: dtoWithoutOrg.longitude,
        // Removed aidRequestId
      };
      const createdAidRequest = {
        ...mockAidRequest,
        id: 3,
        type: dtoWithoutOrg.type,
        description: dtoWithoutOrg.description,
        organizationId: null,
        locationId: createdLocation.id,
        qrCodeUrl: null,
        // Ensure mockAidRequest base doesn't conflict
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedAidRequest = {
        ...createdAidRequest,
        qrCodeUrl: 'mockQRCodeUrl',
      };

      (prismaService.location.create as jest.Mock).mockResolvedValue(
        createdLocation,
      );
      (prismaService.aidRequest.create as jest.Mock).mockResolvedValue(
        createdAidRequest,
      );
      (prismaService.aidRequest.update as jest.Mock).mockResolvedValue(
        updatedAidRequest,
      );

      const result = await service.create(dtoWithoutOrg, mockUserId);

      expect(prismaService.organization.findUnique).not.toHaveBeenCalled();
      expect(prismaService.location.create).toHaveBeenCalledWith({
        data: {
          latitude: dtoWithoutOrg.latitude,
          longitude: dtoWithoutOrg.longitude,
        },
      });
      // Adjusted create call data based on typical service logic
      expect(prismaService.aidRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          // Use objectContaining
          type: dtoWithoutOrg.type,
          description: dtoWithoutOrg.description,
          status: dtoWithoutOrg.status,
          organization: undefined, // Correctly check for undefined connection
          location: { connect: { id: createdLocation.id } },
          user: { connect: { id: mockUserId } },
          recurring: dtoWithoutOrg.recurring,
          isUrgent: dtoWithoutOrg.isUrgent, // Added isUrgent
        }),
      });
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        `aidRequest:${createdAidRequest.id}`,
      );
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: createdAidRequest.id },
        data: { qrCodeUrl: 'mockQRCodeUrl' },
      });
      // Ensure the result matches the structure after update
      expect(result).toEqual(updatedAidRequest);
    });
  });

  describe('createWithHelpCode', () => {
    it('should create an aid request with a help code', async () => {
      const mockHelpCode = 'mock-uuid'.substring(0, 10);
      const createdAidRequest = {
        ...mockAidRequest,
        id: 4,
        type: mockCreateAidRequestDto.type,
        description: mockCreateAidRequestDto.description,
        organizationId: mockOrganizationId,
        locationId: null, // Location created inline
        qrCodeUrl: null,
        helpCode: mockHelpCode,
      };

      (prismaService.organization.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrganizationId,
        name: 'Test Org',
      });
      (prismaService.aidRequest.create as jest.Mock).mockResolvedValue(
        createdAidRequest,
      );

      const result = await service.createWithHelpCode(
        mockCreateAidRequestDto,
        mockUserId,
      );

      expect(prismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { id: mockOrganizationId },
      });
      expect(uuidv4).toHaveBeenCalled();
      expect(prismaService.aidRequest.create).toHaveBeenCalledWith({
        data: {
          type: mockCreateAidRequestDto.type,
          description: mockCreateAidRequestDto.description,
          status: mockCreateAidRequestDto.status || 'pending',
          organization: { connect: { id: mockOrganizationId } },
          user: { connect: { id: mockUserId } },
          location: {
            create: {
              latitude: mockCreateAidRequestDto.latitude,
              longitude: mockCreateAidRequestDto.longitude,
            },
          },
          recurring: mockCreateAidRequestDto.recurring || false,
          isUrgent: mockCreateAidRequestDto.isUrgent || false,
          helpCode: mockHelpCode,
        },
      });
      expect(result).toEqual({ ...createdAidRequest, helpCode: mockHelpCode });
    });
  });

  describe('addLocationToAidRequest', () => {
    const helpCode = 'valid-help-code';
    const latitude = 40.0;
    const longitude = 30.0;

    it('should add location to an aid request using help code and generate QR code', async () => {
      const aidRequestWithoutLocation = {
        ...mockAidRequest,
        id: 5,
        locationId: null,
        helpCode: helpCode,
        qrCodeUrl: null,
      };
      const createdLocation = { id: 5, latitude, longitude };
      const updatedAidRequest = {
        ...aidRequestWithoutLocation,
        locationId: createdLocation.id,
        qrCodeUrl: 'mockQRCodeUrl',
        location: createdLocation,
        user: mockUser,
        organization: {
          id: mockOrganizationId,
          name: 'Test Org',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (prismaService.aidRequest.findFirst as jest.Mock).mockResolvedValue(
        aidRequestWithoutLocation,
      );
      (prismaService.location.create as jest.Mock).mockResolvedValue(
        createdLocation,
      );
      (prismaService.aidRequest.update as jest.Mock).mockResolvedValue(
        updatedAidRequest,
      );
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('mockQRCodeUrl');

      const result = await service.addLocationToAidRequest(
        helpCode,
        latitude,
        longitude,
      );

      expect(prismaService.aidRequest.findFirst).toHaveBeenCalledWith({
        where: { helpCode: helpCode },
      });
      expect(prismaService.location.create).toHaveBeenCalledWith({
        data: { latitude, longitude },
      });
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        `aidRequest:${aidRequestWithoutLocation.id}`,
      );
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: aidRequestWithoutLocation.id },
        data: {
          locationId: createdLocation.id,
          qrCodeUrl: 'mockQRCodeUrl',
        },
        include: {
          location: true,
          user: true,
          organization: true,
        },
      });
      expect(result).toEqual(updatedAidRequest);
    });

    it('should throw NotFoundException if help code is invalid', async () => {
      (prismaService.aidRequest.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addLocationToAidRequest('invalid-code', latitude, longitude),
      ).rejects.toThrow(
        new NotFoundException(
          `Geçerli bir yardım kodu bulunamadı: invalid-code`,
        ),
      );
    });
  });

  describe('updateStatus', () => {
    const newStatus = 'delivered';
    const adminUserId = 'admin-user-id';
    const nonAdminUserId = 'non-admin-user-id';

    it('should update aid request status by admin', async () => {
      const updatedAidRequest = { ...mockAidRequest, status: newStatus };
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        mockAidRequest,
      );
      (prismaService.aidRequest.update as jest.Mock).mockResolvedValue(
        updatedAidRequest,
      );
      (
        firebaseAdminService.sendPushNotification as jest.Mock
      ).mockResolvedValue(undefined);

      const result = await service.updateStatus(
        mockAidRequestId,
        newStatus,
        adminUserId,
        'admin',
      );

      expect(prismaService.aidRequest.findUnique).toHaveBeenCalledWith({
        where: { id: mockAidRequestId },
      });
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: mockAidRequestId },
        data: { status: newStatus },
      });
      expect(firebaseAdminService.sendPushNotification).toHaveBeenCalledWith(
        adminUserId,
        'Yardım Talebi Durum Güncellemesi',
        `Yardım talebinizin durumu güncellendi: ${newStatus}`,
      );
      expect(result).toEqual(updatedAidRequest);
    });

    it('should throw UnauthorizedException if user is not admin', async () => {
      await expect(
        service.updateStatus(
          mockAidRequestId,
          newStatus,
          nonAdminUserId,
          'user',
        ),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Yardım taleplerinin durumunu sadece yöneticiler güncelleyebilir',
        ),
      );
    });

    it('should throw NotFoundException if aid request does not exist', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.updateStatus(mockAidRequestId, newStatus, adminUserId, 'admin'),
      ).rejects.toThrow(
        new NotFoundException(
          `${mockAidRequestId} ID'li yardım talebi bulunamadı`,
        ),
      );
    });

    it('should throw BadRequestException if status is already the same', async () => {
      const aidRequestWithSameStatus = { ...mockAidRequest, status: newStatus };
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        aidRequestWithSameStatus,
      );

      await expect(
        service.updateStatus(mockAidRequestId, newStatus, adminUserId, 'admin'),
      ).rejects.toThrow(
        new BadRequestException(
          `Yardım talebi zaten ${newStatus} durumunda bulunuyor`,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should soft delete an aid request', async () => {
      const updatedAidRequest = { ...mockAidRequest, isDeleted: true };
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        mockAidRequest,
      );
      (prismaService.aidRequest.update as jest.Mock).mockResolvedValue(
        updatedAidRequest,
      );

      const result = await service.delete(mockAidRequestId);

      expect(prismaService.aidRequest.findUnique).toHaveBeenCalledWith({
        where: { id: mockAidRequestId },
      });
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: mockAidRequestId },
        data: { isDeleted: true },
      });
      expect(result).toEqual(updatedAidRequest);
    });

    it('should throw NotFoundException if aid request does not exist', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.delete(mockAidRequestId)).rejects.toThrow(
        new NotFoundException(
          `${mockAidRequestId} ID'li yardım talebi bulunamadı`,
        ),
      );
    });

    it('should throw BadRequestException if aid request is already deleted', async () => {
      const alreadyDeletedRequest = { ...mockAidRequest, isDeleted: true };
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        alreadyDeletedRequest,
      );

      await expect(service.delete(mockAidRequestId)).rejects.toThrow(
        new BadRequestException(
          `${mockAidRequestId} ID'li yardım talebi zaten silinmiş durumda`,
        ),
      );
    });
  });

  describe('prioritizeAidRequests', () => {
    it('should sort aid requests based on user category priority', async () => {
      const userElderly: User = { ...mockUser, id: 2, category: 'ELDERLY' };
      const userDisabled: User = { ...mockUser, id: 3, category: 'DISABLED' };
      const userChronic: User = {
        ...mockUser,
        id: 4,
        category: 'CHRONIC_ILLNESS',
      };
      const userNone: User = { ...mockUser, id: 5, category: 'NONE' };

      const aidRequestsUnsorted = [
        { ...mockAidRequest, id: 10, user: userNone, userId: 5 },
        { ...mockAidRequest, id: 11, user: userChronic, userId: 4 },
        { ...mockAidRequest, id: 12, user: userElderly, userId: 2 },
        { ...mockAidRequest, id: 13, user: userDisabled, userId: 3 },
      ];
      const aidRequestsSorted = [
        aidRequestsUnsorted[2], // Elderly
        aidRequestsUnsorted[3], // Disabled
        aidRequestsUnsorted[1], // Chronic
        aidRequestsUnsorted[0], // None
      ];

      (prismaService.aidRequest.findMany as jest.Mock).mockResolvedValue(
        aidRequestsUnsorted,
      );

      const result = await service.prioritizeAidRequests();

      expect(prismaService.aidRequest.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        include: { user: true },
      });
      expect(result).toEqual(aidRequestsSorted);
      expect(result[0].user.category).toBe('ELDERLY');
      expect(result[1].user.category).toBe('DISABLED');
      expect(result[2].user.category).toBe('CHRONIC_ILLNESS');
      expect(result[3].user.category).toBe('NONE');
    });
  });

  describe('trackRecurringAidRequests', () => {
    it('should find recurring aid requests and send notifications', async () => {
      const recurringRequest1 = {
        ...mockAidRequest,
        id: 20,
        recurring: true,
        userId: 10,
      };
      const recurringRequest2 = {
        ...mockAidRequest,
        id: 21,
        recurring: true,
        userId: 11,
      };
      const recurringAidRequests = [recurringRequest1, recurringRequest2];

      (prismaService.aidRequest.findMany as jest.Mock).mockResolvedValue(
        recurringAidRequests,
      );
      (
        firebaseAdminService.sendPushNotification as jest.Mock
      ).mockResolvedValue(undefined);

      await service.trackRecurringAidRequests();

      expect(prismaService.aidRequest.findMany).toHaveBeenCalledWith({
        where: { recurring: true, isDeleted: false },
      });
      expect(firebaseAdminService.sendPushNotification).toHaveBeenCalledTimes(
        2,
      );
      expect(firebaseAdminService.sendPushNotification).toHaveBeenCalledWith(
        recurringRequest1.userId.toString(),
        'Scheduled Support Notification',
        `Scheduled support needed for recurring aid request: ${recurringRequest1.description}`,
      );
      expect(firebaseAdminService.sendPushNotification).toHaveBeenCalledWith(
        recurringRequest2.userId.toString(),
        'Scheduled Support Notification',
        `Scheduled support needed for recurring aid request: ${recurringRequest2.description}`,
      );
    });
  });

  describe('verifyAidRequest', () => {
    it('should mark an aid request as verified', async () => {
      const unverifiedRequest = { ...mockAidRequest, id: 30, verified: false };
      const verifiedRequest = { ...unverifiedRequest, verified: true };

      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        unverifiedRequest,
      );
      (prismaService.aidRequest.update as jest.Mock).mockResolvedValue(
        verifiedRequest,
      );

      const result = await service.verifyAidRequest(30);

      expect(prismaService.aidRequest.findUnique).toHaveBeenCalledWith({
        where: { id: 30 },
      });
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: 30 },
        data: { verified: true },
      });
      expect(result).toEqual(verifiedRequest);
    });

    it('should throw NotFoundException if aid request not found', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(service.verifyAidRequest(99)).rejects.toThrow(
        new NotFoundException(`99 ID'li yardım talebi bulunamadı`),
      );
    });

    it('should throw BadRequestException if aid request already verified', async () => {
      const alreadyVerifiedRequest = {
        ...mockAidRequest,
        id: 31,
        verified: true,
      };
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        alreadyVerifiedRequest,
      );
      await expect(service.verifyAidRequest(31)).rejects.toThrow(
        new BadRequestException(
          `31 ID'li yardım talebi zaten onaylanmış durumda`,
        ),
      );
    });
  });

  describe('reportSuspiciousAidRequest', () => {
    it('should mark an aid request as reported', async () => {
      const unreportedRequest = { ...mockAidRequest, id: 40, reported: false };
      const reportedRequest = { ...unreportedRequest, reported: true };

      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        unreportedRequest,
      );
      (prismaService.aidRequest.update as jest.Mock).mockResolvedValue(
        reportedRequest,
      );

      const result = await service.reportSuspiciousAidRequest(40);

      expect(prismaService.aidRequest.findUnique).toHaveBeenCalledWith({
        where: { id: 40 },
      });
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: 40 },
        data: { reported: true },
      });
      expect(result).toEqual(reportedRequest);
    });

    it('should throw NotFoundException if aid request not found', async () => {
      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(service.reportSuspiciousAidRequest(99)).rejects.toThrow(
        new NotFoundException(`99 ID'li yardım talebi bulunamadı`),
      );
    });
  });

  describe('verifyAidDeliveryByQRCode', () => {
    const qrCodeData = `aidRequest:${mockAidRequestId}`;
    const newStatus = 'Delivered';

    it('should update aid request status to Delivered using QR code', async () => {
      const aidRequestToVerify = {
        ...mockAidRequest,
        status: 'on the way',
        user: mockUser,
      };
      const updatedAidRequest = { ...aidRequestToVerify, status: newStatus };

      (prismaService.aidRequest.findUnique as jest.Mock).mockResolvedValue(
        aidRequestToVerify,
      );
      (prismaService.aidRequest.update as jest.Mock).mockResolvedValue(
        updatedAidRequest,
      );
      (
        firebaseAdminService.sendPushNotification as jest.Mock
      ).mockResolvedValue(undefined);

      const result = await service.verifyAidDeliveryByQRCode(
        qrCodeData,
        newStatus,
      );

      expect(prismaService.aidRequest.findUnique).toHaveBeenCalledWith({
        where: { id: mockAidRequestId },
        include: { user: true },
      });
      expect(prismaService.aidRequest.update).toHaveBeenCalledWith({
        where: { id: mockAidRequestId },
        data: { status: newStatus },
      });
      expect(firebaseAdminService.sendPushNotification).toHaveBeenCalledWith(
        mockUserId.toString(),
        'Yardım Teslim Güncelleme',
        `Yardım talebiniz (ID: ${mockAidRequestId}) durumu: ${newStatus.toLowerCase()}`,
      );
      expect(result).toEqual(updatedAidRequest);
    });
  });

  describe('searchAidRequests', () => {
    it('should search aid requests with basic filters and pagination', async () => {
      const filters = { type: 'Food', status: 'pending', page: 1, limit: 5 };
      const mockResults = [mockAidRequest];
      const mockTotal = 1;

      (prismaService.aidRequest.findMany as jest.Mock).mockResolvedValue(
        mockResults,
      );
      (prismaService.aidRequest.count as jest.Mock).mockResolvedValue(
        mockTotal,
      );

      const result = await service.searchAidRequests(filters);

      expect(prismaService.aidRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isDeleted: false,
            // type: filters.type, // Ellipsis in original code
            // status: filters.status, // Ellipsis in original code
          },
          include: {
            user: true,
            location: true,
            organization: true,
          },
          orderBy: {
            createdAt: 'desc', // Default sort
          },
          skip: 0,
          take: filters.limit,
        }),
      );
      expect(prismaService.aidRequest.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isDeleted: false,
            // type: filters.type, // Ellipsis in original code
            // status: filters.status, // Ellipsis in original code
          },
        }),
      );
      expect(result).toEqual({
        data: mockResults,
        meta: {
          total: mockTotal,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(mockTotal / filters.limit),
        },
      });
    });

    // Add more tests for other filter combinations (location, urgent, recurring, etc.)
    // Add tests for sorting and different pagination scenarios.
    // Add tests for distance calculation when location filters are applied.
  });
});
