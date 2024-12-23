import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';

@Injectable()
export class FaqService {
  private faqs = [];

  create(createFaqDto: CreateFaqDto) {
    const newFaq = { id: Date.now(), ...createFaqDto };
    this.faqs.push(newFaq);
    return newFaq;
  }

  findAll() {
    return this.faqs;
  }

  findOne(id: number) {
    return this.faqs.find(faq => faq.id === id);
  }

  update(id: number, updateFaqDto: CreateFaqDto) {
    const faqIndex = this.faqs.findIndex(faq => faq.id === id);
    if (faqIndex === -1) {
      return null;
    }
    this.faqs[faqIndex] = { ...this.faqs[faqIndex], ...updateFaqDto };
    return this.faqs[faqIndex];
  }

  remove(id: number) {
    const faqIndex = this.faqs.findIndex(faq => faq.id === id);
    if (faqIndex === -1) {
      return null;
    }
    const removedFaq = this.faqs.splice(faqIndex, 1);
    return removedFaq[0];
  }
}
