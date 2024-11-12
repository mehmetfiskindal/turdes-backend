import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppService', () => {
  let appService: AppService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            organization: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should return organization names', async () => {
    const mockOrganizations = [
      {
        id: 1,
        name: 'Org1',
        type: 'Type1',
        mission: 'Mission1',
        address: 'Address1',
        phone: 'Phone1',
        email: 'Email1',
        website: 'Website1',
        socialMedia: 'SocialMedia1',
        contactName: 'ContactName1',
        contactPhone: 'ContactPhone1',
        contactEmail: 'ContactEmail1',
        donationAccount: 'DonationAccount1',
        iban: 'IBAN1',
        taxNumber: 'TaxNumber1',
        aidTypes: 'AidTypes1',
        createdAt: new Date(),
        updatedAt: new Date(),
        targetAudience: 'TargetAudience1',
        volunteerNeeds: 'VolunteerNeeds1',
        activeProjects: 'ActiveProjects1',
        events: 'Events1',
        partnerships: 'Partnerships1',
        fundingSources: 'FundingSources1',
        annualBudget: 'AnnualBudget1',
      },
      {
        id: 2,
        name: 'Org2',
        type: 'Type2',
        mission: 'Mission2',
        address: 'Address2',
        phone: 'Phone2',
        email: 'Email2',
        website: 'Website2',
        socialMedia: 'SocialMedia2',
        contactName: 'ContactName2',
        contactPhone: 'ContactPhone2',
        contactEmail: 'ContactEmail2',
        donationAccount: 'DonationAccount1',
        iban: 'IBAN1',
        taxNumber: 'TaxNumber1',
        aidTypes: 'AidTypes1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    prismaService.organization.findMany = jest
      .fn()
      .mockResolvedValue(mockOrganizations);

    const result = await appService.getOrganizationNames();
    expect(result).toEqual(['Org1', 'Org2']);
  });
});
