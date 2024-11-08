import { Test, TestingModule } from '@nestjs/testing';
import { AidRequestsController } from './aid-requests.controller';
import { AidRequestsService } from './aid-requests.service';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { Role } from '../roles/roles.enum';

describe('AidRequestsController', () => {
  let controller: AidRequestsController;
  let service: AidRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AidRequestsController],
      providers: [
        {
          provide: AidRequestsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            updateStatus: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AidRequestsController>(AidRequestsController);
    service = module.get<AidRequestsService>(AidRequestsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of aid requests', async () => {
      const result = [
        {
          id: 1,
          type: 'Test Type',
          description: 'Test Description',
          status: 'Test Status',
          organizationId: 1,
          latitude: 43.343,
          longitude: 34.532,
          userId: 1,
          isDeleted: false,
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(
        await controller.findAll({
          user: {
            id: 1,
            name: 'mehmet',
            email: 'developersailor@gmail.com',
            phone: null,
            passwordHash: '',
            role: '',
            refreshToken: null,
            createdAt: undefined,
            updatedAt: undefined,
          },
        })
      ).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new aid request', async () => {
      const createAidRequestDto: CreateAidRequestDto = {
        type: 'Test Type',
        description: 'Test Description',
        status: 'Test Status',
        organizationId: 1,
        latitude: 43.343,
        longitude: 34.532,
        userId: 1,
        isDeleted: false,
      };
      const result = { id: 1, ...createAidRequestDto };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(
        await controller.create(createAidRequestDto, {
          user: {
            id: 1,
            name: '',
            email: '',
            phone: null,
            passwordHash: '',
            role: '',
            refreshToken: null,
            createdAt: undefined,
            updatedAt: undefined,
          },
        })
      ).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a specific aid request', async () => {
      const result = {
        id: 1,
        type: 'Test Type',
        description: 'Test Description',
        status: 'Test Status',
        organizationId: 1,
        latitude: 43.343,
        longitude: 34.532,
        userId: 1,
        isDeleted: false,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1, 1)).toBe(result);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a specific aid request', async () => {
      const result = {
        id: 1,
        type: 'Test Type',
        description: 'Test Description',
        status: 'updated',
        organizationId: 1,
        latitude: 43.343,
        longitude: 34.532,
        userId: 1,
        isDeleted: false,
      };
      jest.spyOn(service, 'updateStatus').mockResolvedValue(result);

      expect(
        await controller.updateStatus('1', 'updated', {
          user: { id: 1, role: Role.Admin, deviceToken: 'token' },
        })
      ).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete a specific aid request', async () => {
      const result = {
        id: 1,
        type: 'Test Type',
        description: 'Test Description',
        status: 'Test Status',
        organizationId: 1,
        latitude: 43.343,
        longitude: 34.532,
        userId: 1,
        isDeleted: true,
      };
      jest.spyOn(service, 'delete').mockResolvedValue(result);

      expect(await controller.delete(1)).toBe(result);
    });
  });
});
