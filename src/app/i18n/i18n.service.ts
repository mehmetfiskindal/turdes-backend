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

  addTranslation(lang: string, key: string, value: string): void {
    if (!this.translations[lang]) {
      this.translations[lang] = {};
    }
    this.translations[lang][key] = value;
  }

  removeTranslation(lang: string, key: string): void {
    if (this.translations[lang]) {
      delete this.translations[lang][key];
    }
  }

  listTranslations(lang: string): { [key: string]: string } {
    return this.translations[lang] || {};
  }
}
