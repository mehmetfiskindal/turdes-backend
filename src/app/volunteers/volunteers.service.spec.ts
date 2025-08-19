import { Test, TestingModule } from '@nestjs/testing';
import { VolunteersService } from './volunteers.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

describe('VolunteersService', () => {
  let service: VolunteersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteersService,
        {
          provide: PrismaService,
          useValue: {
            volunteer: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
            },
            taskAssignment: {
              create: jest.fn(),
              findFirst: jest.fn(),
            },
            task: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<VolunteersService>(VolunteersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new volunteer', async () => {
      const createVolunteerDto: CreateVolunteerDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        skills: ['First Aid', 'Cooking'],
      };
      const result = {
        id: 1,
        name: 'Test Volunteer',
        email: 'test@volunteer.com',
        phone: '1234567890',
        tasks: 'Test Task',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.volunteer, 'create').mockResolvedValue(result);
      jest.spyOn(prismaService.volunteer, 'findFirst').mockResolvedValue(null);

      expect(await service.register(createVolunteerDto)).toBe(result);
    });
  });

  describe('assignTask', () => {
    it('should assign a task to a volunteer', async () => {
      const assignTaskDto: AssignTaskDto = {
        volunteerId: 1,
        taskId: 1,
      };
      const result = {
        id: 1,
        ...assignTaskDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prismaService.taskAssignment, 'create')
        .mockResolvedValue(result);
      jest.spyOn(prismaService.volunteer, 'findUnique').mockResolvedValue({
        id: 1,
        name: 'Volunteer 1',
        email: 'v1@test.com',
        phone: '123',
        tasks: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue({
        id: 1,
        name: 'Task 1',
        description: 'Desc',
        latitude: 0,
        longitude: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      jest
        .spyOn(prismaService.taskAssignment, 'findFirst')
        .mockResolvedValue(null);

      expect(await service.assignTask(assignTaskDto)).toBe(result);
    });
  });
});
