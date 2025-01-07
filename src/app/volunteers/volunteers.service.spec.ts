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
            },
            taskAssignment: {
              create: jest.fn(),
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
      const result = { id: 1, ...createVolunteerDto, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.volunteer, 'create').mockResolvedValue(result);

      expect(await service.register(createVolunteerDto)).toBe(result);
    });
  });

  describe('assignTask', () => {
    it('should assign a task to a volunteer', async () => {
      const assignTaskDto: AssignTaskDto = {
        volunteerId: 1,
        taskId: 1,
      };
      const result = { id: 1, ...assignTaskDto, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.taskAssignment, 'create').mockResolvedValue(result);

      expect(await service.assignTask(assignTaskDto)).toBe(result);
    });
  });
});
