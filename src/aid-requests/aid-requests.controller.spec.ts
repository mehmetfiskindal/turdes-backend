import { Test, TestingModule } from '@nestjs/testing';
import { AidRequestsController } from './aid-requests.controller';

describe('AidRequestsController', () => {
  let controller: AidRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AidRequestsController],
    }).compile();

    controller = module.get<AidRequestsController>(AidRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
