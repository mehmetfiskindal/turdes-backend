import { Test, TestingModule } from '@nestjs/testing';
import { AidRequestsController } from './aid-requests.controller';
import { AidRequestsService } from './aid-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { RequestWithUser } from './interfaces/request-with-user.interface';

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
            addComment: jest.fn(),
            uploadDocument: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AidRequestsController>(AidRequestsController);
    service = module.get<AidRequestsService>(AidRequestsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of aid requests', async () => {
      const result = [{ id: 1, type: 'Food', description: 'Need food' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll({ user: { id: 1 } } as RequestWithUser)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new aid request', async () => {
      const createAidRequestDto: CreateAidRequestDto = {
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
      const result = { id: 1, ...createAidRequestDto };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createAidRequestDto, { user: { id: 1 } } as RequestWithUser)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a specific aid request', async () => {
      const result = { id: 1, type: 'Food', description: 'Need food' };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1, 1, { user: { id: 1 } } as RequestWithUser)).toBe(result);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a specific aid request', async () => {
      const result = { id: 1, status: 'Completed' };
      jest.spyOn(service, 'updateStatus').mockResolvedValue(result);

      expect(await controller.updateStatus(1, 'Completed', '1', 'admin')).toBe(result);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a specific aid request', async () => {
      const result = { id: 1, content: 'This is a comment' };
      jest.spyOn(service, 'addComment').mockResolvedValue(result);

      expect(await controller.addComment(1, 'This is a comment')).toBe(result);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document to a specific aid request', async () => {
      const result = { id: 1, documentName: 'Document', documentUrl: 'http://example.com' };
      jest.spyOn(service, 'uploadDocument').mockResolvedValue(result);

      expect(await controller.uploadDocument(1, 'Document', 'http://example.com')).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete a specific aid request', async () => {
      const result = { id: 1, isDeleted: true };
      jest.spyOn(service, 'delete').mockResolvedValue(result);

      expect(await controller.delete(1)).toBe(result);
    });
  });
});
