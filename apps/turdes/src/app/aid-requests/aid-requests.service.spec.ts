import { Test, TestingModule } from '@nestjs/testing';
import { AidRequestsService } from './aid-requests.service';

describe('AidRequestsService', () => {
  let service: AidRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AidRequestsService],
    }).compile();

    service = module.get<AidRequestsService>(AidRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
