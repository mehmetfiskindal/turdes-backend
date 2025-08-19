import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
	let controller: AppController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				AppService,
				{
					provide: PrismaService,
					useValue: {
						organization: { findMany: jest.fn().mockResolvedValue([]) },
					},
				},
			],
		}).compile();

		controller = module.get<AppController>(AppController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
