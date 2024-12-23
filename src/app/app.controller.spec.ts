import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getOrganizationNames: jest.fn().mockResolvedValue(['Org1', 'Org2']),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true), // Guard'ı geçerli kılmak için mock
      })
      .compile();

    appController = moduleRef.get<AppController>(AppController);
    appService = moduleRef.get<AppService>(AppService);
  });

  describe('getOrganizationNames', () => {
    it('should return an array of organization names', async () => {
      const result = await appController.getOrganizationNames();
      expect(result).toEqual(['Org1', 'Org2']);
    });

    it('should call getOrganizationNames method of AppService', async () => {
      const spy = jest.spyOn(appService, 'getOrganizationNames');
      await appController.getOrganizationNames();
      expect(spy).toHaveBeenCalled();
    });
  });
});
