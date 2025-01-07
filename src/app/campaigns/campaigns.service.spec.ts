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
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
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

  describe('createCampaign', () => {
    it('should create a new campaign', async () => {
      const createCampaignDto: CreateCampaignDto = {
        name: 'Campaign 1',
        description: 'Description 1',
        startDate: new Date(),
        endDate: new Date(),
        targetAmount: 1000,
        organizationId: 1,
      };
      const result = { id: 1, ...createCampaignDto, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.campaign, 'create').mockResolvedValue(result);

      expect(await service.createCampaign(createCampaignDto)).toBe(result);
    });
  });

  describe('findAllCampaigns', () => {
    it('should return an array of campaigns', async () => {
      const result = [{ id: 1, name: 'Campaign 1', createdAt: new Date(), updatedAt: new Date(), organizationId: 1, description: 'Description 1', endDate: new Date(), targetAmount: 1000 }];
      jest.spyOn(prismaService.campaign, 'findMany').mockResolvedValue(result);

      expect(await service.findAllCampaigns()).toBe(result);
    });
  });

  describe('findCampaignById', () => {
    it('should return a specific campaign', async () => {
      const result = { id: 1, name: 'Campaign 1', createdAt: new Date(), updatedAt: new Date(), organizationId: 1, description: 'Description 1', endDate: new Date(), targetAmount: 1000 };
      jest.spyOn(prismaService.campaign, 'findUnique').mockResolvedValue(result);

      expect(await service.findCampaignById(1)).toBe(result);
    });
  });

  describe('updateCampaign', () => {
    it('should update a specific campaign', async () => {
      const updateCampaignDto: CreateCampaignDto = {
        name: 'Updated Campaign',
        description: 'Updated Description',
        startDate: new Date(),
        endDate: new Date(),
        targetAmount: 2000,
        organizationId: 1,
      };
      const result = { id: 1, ...updateCampaignDto, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.campaign, 'update').mockResolvedValue(result);

      expect(await service.updateCampaign(1, updateCampaignDto)).toBe(result);
    });
  });

  describe('deleteCampaign', () => {
    it('should delete a specific campaign', async () => {
      const result = { id: 1, name: 'Campaign 1', createdAt: new Date(), updatedAt: new Date(), organizationId: 1, description: 'Description 1', endDate: new Date(), targetAmount: 1000 };
      jest.spyOn(prismaService.campaign, 'delete').mockResolvedValue(result);

      expect(await service.deleteCampaign(1)).toBe(result);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Event 1',
        description: 'Description 1',
        date: new Date(),
        location: 'Location 1',
        organizationId: 1,
      };
      const result = { id: 1, ...createEventDto, createdAt: new Date(), updatedAt: new Date(), campaignId: 1 };
      jest.spyOn(prismaService.event, 'create').mockResolvedValue(result);

      expect(await service.createEvent(1, createEventDto)).toBe(result);
    });
  });

  describe('findAllEvents', () => {
    it('should return an array of events', async () => {
      const result = [{ id: 1, name: 'Event 1', createdAt: new Date(), updatedAt: new Date(), organizationId: 1, description: 'Description 1', location: 'Location 1', date: new Date(), campaignId: 1 }];
      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue(result);

      expect(await service.findAllEvents(1)).toBe(result);
    });
  });

  describe('findEventById', () => {
    it('should return a specific event', async () => {
      const result = { id: 1, name: 'Event 1', createdAt: new Date(), updatedAt: new Date(), organizationId: 1, description: 'Description 1', location: 'Location 1', date: new Date(), campaignId: 1 };
      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(result);

      expect(await service.findEventById(1, 1)).toBe(result);
    });
  });

  describe('updateEvent', () => {
    it('should update a specific event', async () => {
      const updateEventDto: CreateEventDto = {
        name: 'Updated Event',
        description: 'Updated Description',
        date: new Date(),
        location: 'Updated Location',
        organizationId: 1,
      };
      const result = { id: 1, ...updateEventDto, createdAt: new Date(), updatedAt: new Date(), campaignId: 1 };
      jest.spyOn(prismaService.event, 'update').mockResolvedValue(result);

      expect(await service.updateEvent(1, 1, updateEventDto)).toBe(result);
    });
  });

  describe('deleteEvent', () => {
    it('should delete a specific event', async () => {
      const result = { id: 1, name: 'Event 1', createdAt: new Date(), updatedAt: new Date(), organizationId: 1, description: 'Description 1', location: 'Location 1', date: new Date(), campaignId: 1 };
      jest.spyOn(prismaService.event, 'delete').mockResolvedValue(result);

      expect(await service.deleteEvent(1, 1)).toBe(result);
    });
  });
});
