import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { AidRequest } from '@prisma/client';
import { AidRequestsService } from './aid-requests.service';

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
    firebaseAdminService =
      module.get<FirebaseAdminService>(FirebaseAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of aid requests', async () => {
      const result: AidRequest[] = [];
      jest
        .spyOn(prismaService.aidRequest, 'findMany')
        .mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single aid request', async () => {
      const result: AidRequest = {
        id: 1,
        type: 'type',
        description: 'desc',
        organizationId: 1,
        userId: 1,
        status: 'status',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prismaService.aidRequest, 'findUnique')
        .mockResolvedValue(result);

      expect(await service.findOne('1')).toBe(result);
    });
  });

  describe('create', () => {
    it('should create and return a new aid request', async () => {
      const createAidRequestDto: CreateAidRequestDto = {
        type: 'type',
        description: 'desc',
        organizationId: 1,
        userId: 1,
      };
      const result: AidRequest = {
        id: 1,
        type: 'type',
        description: 'desc',
        organizationId: 1,
        userId: 1,
        status: 'status',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.aidRequest, 'create').mockResolvedValue(result);

      expect(await service.create(createAidRequestDto)).toBe(result);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of an aid request and send a push notification', async () => {
      const result: AidRequest = {
        id: 1,
        type: 'type',
        description: 'desc',
        organizationId: 1,
        userId: 1,
        status: 'new status',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockDeviceToken = 'deviceToken'; // Mock bir token kullanıyoruz

      jest.spyOn(prismaService.aidRequest, 'update').mockResolvedValue(result);
      jest
        .spyOn(firebaseAdminService, 'sendPushNotification')
        .mockResolvedValue('Mocked Response');

      expect(await service.updateStatus(1, 'new status', mockDeviceToken)).toBe(
        result
      );
      expect(firebaseAdminService.sendPushNotification).toHaveBeenCalledWith(
        mockDeviceToken,
        'Yardım talebinizin durumu güncellendi: new status'
      );
    });

    it('should handle errors when sending push notifications', async () => {
      const result: AidRequest = {
        id: 1,
        type: 'type',
        description: 'desc',
        organizationId: 1,
        userId: 1,
        status: 'new status',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockDeviceToken = 'deviceToken'; // Mock token

      jest.spyOn(prismaService.aidRequest, 'update').mockResolvedValue(result);
      jest
        .spyOn(firebaseAdminService, 'sendPushNotification')
        .mockRejectedValue(new Error('Push notification error'));

      await service.updateStatus(1, 'new status', mockDeviceToken);
      expect(firebaseAdminService.sendPushNotification).toHaveBeenCalledWith(
        mockDeviceToken,
        'Yardım talebinizin durumu güncellendi: new status'
      );
    });
  });
});
