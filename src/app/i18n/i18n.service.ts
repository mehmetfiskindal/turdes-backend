import { Injectable } from '@nestjs/common';

@Injectable()
export class I18nService {
  private translations: { [key: string]: { [key: string]: string } } = {
    en: {
      welcome: 'Welcome',
      goodbye: 'Goodbye',
    },
    tr: {
      welcome: 'Hoş geldiniz',
      goodbye: 'Güle güle',
    },
  };

  translate(key: string, lang: string): string {
    return this.translations[lang]?.[key] || key;
  }
}
