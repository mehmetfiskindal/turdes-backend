import { Test, TestingModule } from '@nestjs/testing';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';

describe('FaqService', () => {
  let service: FaqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaqService],
    }).compile();

    service = module.get<FaqService>(FaqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new FAQ', () => {
      const createFaqDto: CreateFaqDto = { question: 'What is NestJS?', answer: 'A progressive Node.js framework.' };
      const result = service.create(createFaqDto);
      expect(result).toEqual({ id: expect.any(Number), ...createFaqDto });
    });
  });

  describe('findAll', () => {
    it('should return an array of FAQs', () => {
      const result = service.findAll();
      expect(result).toEqual(expect.any(Array));
    });
  });

  describe('findOne', () => {
    it('should return a specific FAQ', () => {
      const createFaqDto: CreateFaqDto = { question: 'What is NestJS?', answer: 'A progressive Node.js framework.' };
      const createdFaq = service.create(createFaqDto);
      const result = service.findOne(createdFaq.id);
      expect(result).toEqual(createdFaq);
    });
  });

  describe('update', () => {
    it('should update a specific FAQ', () => {
      const createFaqDto: CreateFaqDto = { question: 'What is NestJS?', answer: 'A progressive Node.js framework.' };
      const createdFaq = service.create(createFaqDto);
      const updateFaqDto: CreateFaqDto = { question: 'What is NestJS?', answer: 'A powerful Node.js framework.' };
      const result = service.update(createdFaq.id, updateFaqDto);
      expect(result).toEqual({ id: createdFaq.id, ...updateFaqDto });
    });
  });

  describe('remove', () => {
    it('should remove a specific FAQ', () => {
      const createFaqDto: CreateFaqDto = { question: 'What is NestJS?', answer: 'A progressive Node.js framework.' };
      const createdFaq = service.create(createFaqDto);
      const result = service.remove(createdFaq.id);
      expect(result).toEqual(createdFaq);
    });
  });
});
