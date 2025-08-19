import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateEventDto } from './dto/create-event.dto';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: PrismaService,
          useValue: {
            campaign: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            organization: { findUnique: jest.fn() },
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const orgMock = () => ({
    id: 1,
    name: 'Org',
    createdAt: new Date(),
    updatedAt: new Date(),
    contactInfoId: 1,
    addressId: 1,
    mission: 'm',
    type: 't',
    rating: 0,
    feedback: '',
  });

  const campaignMock = (overrides: Partial<any> = {}) => ({
    id: 1,
    name: 'Campaign 1',
    description: 'Desc',
    endDate: new Date(),
    targetAmount: 1000,
    organizationId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const eventMock = (overrides: Partial<any> = {}) => ({
    id: 1,
    name: 'Event 1',
    description: 'Description 1',
    date: new Date(),
    location: 'Location 1',
    organizationId: 1,
    campaignId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('createCampaign', () => {
    it('should create a new campaign', async () => {
      const future = new Date(Date.now() + 1000 * 60 * 60); // +1 hour
      const createCampaignDto: CreateCampaignDto = {
        name: 'Campaign 1',
        description: 'Description 1',
        startDate: new Date(),
        endDate: future,
        targetAmount: 1000,
        organizationId: 1,
      };
      const result = { ...campaignMock(), ...createCampaignDto };
      jest
        .spyOn(prismaService.organization, 'findUnique')
        .mockResolvedValue(orgMock());
      jest
        .spyOn(prismaService.campaign, 'create')
        .mockResolvedValue(result as any);
      expect(await service.createCampaign(createCampaignDto)).toBe(result);
    });
  });

  describe('findAllCampaigns', () => {
    it('should return an array of campaigns', async () => {
      const result = [campaignMock()];
      jest
        .spyOn(prismaService.campaign, 'findMany')
        .mockResolvedValue(result as any);
      expect(await service.findAllCampaigns()).toBe(result);
    });
  });

  describe('findCampaignById', () => {
    it('should return a specific campaign', async () => {
      const result = campaignMock();
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(result as any);
      expect(await service.findCampaignById(1)).toBe(result);
    });
  });

  describe('updateCampaign', () => {
    it('should update a specific campaign', async () => {
      const future = new Date(Date.now() + 1000 * 60 * 60 * 2); // +2 hours
      const updateCampaignDto: CreateCampaignDto = {
        name: 'Updated Campaign',
        description: 'Updated Description',
        startDate: new Date(),
        endDate: future,
        targetAmount: 2000,
        organizationId: 1,
      };
      const existing = campaignMock();
      const updated = { ...existing, ...updateCampaignDto };
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(existing as any);
      jest
        .spyOn(prismaService.organization, 'findUnique')
        .mockResolvedValue(orgMock() as any);
      jest
        .spyOn(prismaService.campaign, 'update')
        .mockResolvedValue(updated as any);
      expect(await service.updateCampaign(1, updateCampaignDto)).toBe(updated);
    });
  });

  describe('deleteCampaign', () => {
    it('should delete a specific campaign', async () => {
      const existing = campaignMock();
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(existing as any);
  jest.spyOn(prismaService.event, 'count').mockResolvedValue(0); // eslint-disable-line
      jest
        .spyOn(prismaService.campaign, 'delete')
        .mockResolvedValue(existing as any);
      expect(await service.deleteCampaign(1)).toBe(existing);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const future = new Date(Date.now() + 1000 * 60 * 60 * 3); // +3 hours
      const createEventDto: CreateEventDto = {
        name: 'Event 1',
        description: 'Description 1',
        date: future,
        location: 'Location 1',
        organizationId: 1,
      };
      const camp = campaignMock();
      const result = eventMock();
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(camp as any);
      jest
        .spyOn(prismaService.organization, 'findUnique')
        .mockResolvedValue(orgMock() as any);
      jest
        .spyOn(prismaService.event, 'create')
        .mockResolvedValue(result as any);
      expect(await service.createEvent(1, createEventDto)).toBe(result);
    });
  });

  describe('findAllEvents', () => {
    it('should return an array of events', async () => {
      const camp = campaignMock();
      const result = [eventMock()];
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(camp as any);
      jest
        .spyOn(prismaService.event, 'findMany')
        .mockResolvedValue(result as any);
      expect(await service.findAllEvents(1)).toBe(result);
    });
  });

  describe('findEventById', () => {
    it('should return a specific event', async () => {
      const camp = campaignMock();
      const result = eventMock();
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(camp as any);
      jest
        .spyOn(prismaService.event, 'findFirst')
        .mockResolvedValue(result as any);
      expect(await service.findEventById(1, 1)).toBe(result);
    });
  });

  describe('updateEvent', () => {
    it('should update a specific event', async () => {
      const updateEventDto: CreateEventDto = {
        name: 'Updated Event',
        description: 'Updated Description',
  date: new Date(Date.now() + 1000 * 60 * 60),
        location: 'Updated Location',
        organizationId: 1,
      };
      const camp = campaignMock();
      const existing = eventMock();
      const updated = { ...existing, ...updateEventDto };
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(camp as any);
      jest
        .spyOn(prismaService.event, 'findFirst')
        .mockResolvedValue(existing as any);
      jest
        .spyOn(prismaService.organization, 'findUnique')
        .mockResolvedValue(orgMock() as any);
      jest
        .spyOn(prismaService.event, 'update')
        .mockResolvedValue(updated as any);
      expect(await service.updateEvent(1, 1, updateEventDto)).toBe(updated);
    });
  });

  describe('deleteEvent', () => {
    it('should delete a specific event', async () => {
      const camp = campaignMock();
      const existing = eventMock();
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(camp as any);
      jest
        .spyOn(prismaService.event, 'findFirst')
        .mockResolvedValue(existing as any);
      jest
        .spyOn(prismaService.event, 'delete')
        .mockResolvedValue(existing as any);
      expect(await service.deleteEvent(1, 1)).toBe(existing);
    });
  });
});
