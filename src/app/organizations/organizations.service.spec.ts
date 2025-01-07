import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organizations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: PrismaService,
          useValue: {
            organization: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            contactInfo: {
              create: jest.fn(),
              update: jest.fn(),
            },
            address: {
              create: jest.fn(),
              update: jest.fn(),
            },
            message: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new organization', async () => {
      const createOrganizationDto = {
        name: 'Test Organization',
        type: 'Non-Profit',
        mission: 'Helping people',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
        contactName: 'John Doe',
        contactPhone: '123-456-7890',
        contactEmail: 'john@example.com',
        donationAccount: '123456789',
        iban: 'TR123456789',
        taxNumber: '123456789',
        aidTypes: 'Food, Shelter',
        targetAudience: 'Homeless',
        volunteerNeeds: 'Volunteers needed',
        latitude: 40.7128,
        longitude: -74.006,
        establishedDate: new Date(),
      };
      const contactInfo = {
        id: 1,
        phone: '1234567890',
        email: 'test@contact.com',
        contactName: 'Test Contact',
        contactPhone: '1234567890',
        contactEmail: 'test@contact.com',
      };
      const address = {
        id: 1,
        address: '123 Test St',
        latitude: 40.7128,
        longitude: -74.006,
      };
      const organization = {
        id: 1,
        ...createOrganizationDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        contactInfoId: 1,
        addressId: 1,
      };

      jest
        .spyOn(prismaService.contactInfo, 'create')
        .mockResolvedValue(contactInfo);
      jest.spyOn(prismaService.address, 'create').mockResolvedValue(address);
      jest
        .spyOn(prismaService.organization, 'create')
        .mockResolvedValue(organization);

      expect(await service.create(createOrganizationDto)).toBe(organization);
    });
  });

  describe('findAll', () => {
    it('should return an array of organizations', async () => {
      const organizations = [
        {
          id: 1,
          name: 'Test Organization',
          type: 'Non-Profit',
          mission: 'Helping people',
          createdAt: new Date(),
          updatedAt: new Date(),
          contactInfoId: 1,
          addressId: 1,
        },
      ];
      jest
        .spyOn(prismaService.organization, 'findMany')
        .mockResolvedValue(organizations);

      expect(await service.findAll()).toBe(organizations);
    });
  });

  describe('findOne', () => {
    it('should return a specific organization', async () => {
      const organization = {
        id: 1,
        name: 'Test Organization',
        type: 'Non-Profit',
        mission: 'Helping people',
        createdAt: new Date(),
        updatedAt: new Date(),
        contactInfoId: 1,
        addressId: 1,
      };
      jest
        .spyOn(prismaService.organization, 'findUnique')
        .mockResolvedValue(organization);

      expect(await service.findOne(1)).toBe(organization);
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      const updateOrganizationDto = {
        name: 'Updated Organization',
        type: 'Non-Profit',
        mission: 'Helping people',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
        contactName: 'John Doe',
        contactPhone: '123-456-7890',
        contactEmail: 'john@example.com',
        donationAccount: '123456789',
        iban: 'TR123456789',
        taxNumber: '123456789',
        aidTypes: 'Food, Shelter',
        targetAudience: 'Homeless',
        volunteerNeeds: 'Volunteers needed',
        latitude: 40.7128,
        longitude: -74.006,
        establishedDate: new Date(),
      };
      const organization = {
        id: 1,
        ...updateOrganizationDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        contactInfoId: 1,
        addressId: 1,
      };
      const contactInfo = {
        id: 1,
        phone: '1234567890',
        email: 'test@contact.com',
        contactName: 'Test Contact',
        contactPhone: '1234567890',
        contactEmail: 'test@contact.com',
      };
      const address = {
        id: 1,
        address: '123 Test St',
        latitude: 40.7128,
        longitude: -74.006,
      };

      jest
        .spyOn(prismaService.organization, 'findUnique')
        .mockResolvedValue(organization);
      jest
        .spyOn(prismaService.contactInfo, 'update')
        .mockResolvedValue(contactInfo);
      jest.spyOn(prismaService.address, 'update').mockResolvedValue(address);
      jest
        .spyOn(prismaService.organization, 'update')
        .mockResolvedValue(organization);

      expect(await service.update(1, updateOrganizationDto)).toBe(organization);
    });
  });

  describe('remove', () => {
    it('should delete an organization', async () => {
      const organization = {
        id: 1,
        name: 'Test Organization',
        type: 'Non-Profit',
        mission: 'Helping people',
        createdAt: new Date(),
        updatedAt: new Date(),
        contactInfoId: 1,
        addressId: 1,
      };
      jest
        .spyOn(prismaService.organization, 'delete')
        .mockResolvedValue(organization);

      expect(await service.remove(1)).toBe(organization);
    });
  });

  describe('sendMessage', () => {
    it('should send a message to an organization', async () => {
      const createMessageDto = {
        content: 'Hello, this is a test message',
        senderId: 1,
        receiverId: 2,
      };
      const message = {
        id: 1,
        content: 'Hello, this is a test message',
        senderId: 1,
        receiverId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        organizationId: 1,
      };

      jest.spyOn(prismaService.message, 'create').mockResolvedValue(message);

      expect(await service.sendMessage(1, createMessageDto)).toBe(message);
    });
  });
});
