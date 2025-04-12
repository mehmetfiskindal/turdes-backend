import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static instance: PrismaService;
  private isConnected = false;

  constructor() {
    super({
      // Bağlantı havuzu yapılandırması
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Bağlantı havuzu sınırlamaları
      // PostgreSQL'in varsayılan 100 bağlantı limitini aşmamak için
      // uygulamanın genel kullanımına göre daha küçük bir değer ayarlayın
    });
  }

  // Singleton pattern - her zaman aynı örneği döndürür
  static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  async onModuleInit() {
    if (!this.isConnected) {
      await this.$connect();
      this.isConnected = true;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
      this.isConnected = false;
      console.log('PrismaService: Database bağlantısı kapatıldı');
    }
  }

  // Test ortamı için bağlantıyı temizlemek için kullanılacak yardımcı method
  async cleanupConnections() {
    try {
      // Aktif transaction'ları rollback et ve bağlantıyı serbest bırak
      await this
        .$executeRaw`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()`;
      await this.$disconnect();
      this.isConnected = false;
      console.log('PrismaService: Bağlantılar temizlendi');
    } catch (e) {
      console.error('Bağlantı temizleme hatası:', e);
    }
  }
}
