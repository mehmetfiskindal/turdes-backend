import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AidRequestsService } from '../aid-requests/aid-requests.service';

@Injectable()
export class MapService {
  constructor(
    private prisma: PrismaService,
    private aidRequestsService: AidRequestsService,
  ) {}

  /**
   * Belirli bir bölgedeki aktif yardım merkezlerini harita için getirir
   * @param bounds Harita görünüm alanı sınırları: {north, south, east, west}
   */
  async getActiveAidCenters(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) {
    // Organization modeli üzerinden (Address tablosu ile bağlantılı) konum bilgisi olan yardım merkezlerini al
    return this.prisma.organization.findMany({
      where: {
        address: {
          latitude: { lte: bounds.north, gte: bounds.south },
          longitude: { lte: bounds.east, gte: bounds.west },
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        mission: true,
        rating: true,
        address: {
          select: {
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        contactInfo: {
          select: {
            phone: true,
            email: true,
            contactName: true,
          },
        },
      },
    });
  }

  /**
   * Yardım taleplerini harita üzerinde göstermek için getirir - rol bazlı filtreleme yapar
   * @param userId Kullanıcının ID'si
   * @param userRole Kullanıcının rolü
   */
  async getAidRequestsForMap(userId?: number, userRole?: string) {
    const filter: any = {
      isDeleted: false,
      locationId: {
        // "not: null" yerine alternatif sorgu kullan
        not: undefined,
      },
    };

    // Admin ve organizasyon sahipleri tüm talepleri görebilir
    // Standart kullanıcılar sadece kendi taleplerini görebilir
    if (userRole !== 'admin' && userRole !== 'organization_owner' && userId) {
      filter.userId = userId;
    }

    return this.prisma.aidRequest.findMany({
      where: filter,
      select: {
        id: true,
        type: true,
        description: true,
        status: true,
        isUrgent: true,
        verified: true,
        userId: true,
        location: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
        user: {
          select: {
            name: true,
            phone: true,
            category: true,
          },
        },
      },
    });
  }

  /**
   * Haritaya yeni yardım talebi ekler
   * @param data Yardım talebi verileri
   * @param userId Kullanıcı ID'si
   */
  async createAidRequestOnMap(
    data: {
      type: string;
      description: string;
      latitude: number;
      longitude: number;
      isUrgent?: boolean;
    },
    userId: number,
  ) {
    try {
      console.log('Gelen userId:', userId);
      console.log('Gelen veri:', data);

      // Önce konum oluştur
      const location = await this.prisma.location.create({
        data: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });

      console.log('Oluşturulan konum:', location);

      // Yardım talebi oluştur ve konumla ilişkilendir
      const aidRequest = await this.prisma.aidRequest.create({
        data: {
          type: data.type,
          description: data.description,
          status: 'pending',
          isUrgent: data.isUrgent || false,
          userId: userId,
          locationId: location.id,
        },
        include: {
          location: true, // Konum bilgisini de dön
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      console.log('Oluşturulan yardım talebi:', aidRequest);
      return aidRequest;
    } catch (error) {
      console.error('Yardım talebi oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Belirli bir konumun çevresindeki görevleri/etkinlikleri harita için getirir
   * @param bounds Harita görünüm alanı sınırları: {north, south, east, west}
   */
  async getTasksForMap(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) {
    return this.prisma.task.findMany({
      where: {
        latitude: { lte: bounds.north, gte: bounds.south },
        longitude: { lte: bounds.east, gte: bounds.west },
      },
      select: {
        id: true,
        name: true,
        description: true,
        latitude: true,
        longitude: true,
        TaskAssignment: {
          select: {
            volunteer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Yardım kodu ile talebe konum ekler
   * @param helpCode Yardım talebi kodu
   * @param latitude Enlem
   * @param longitude Boylam
   */
  async addLocationWithHelpCode(
    helpCode: string,
    latitude: number,
    longitude: number,
  ) {
    // AidRequestsService'deki metodu kullanarak yardım talebine konum ekle
    const response = await this.aidRequestsService.addLocationToAidRequest(
      helpCode,
      latitude,
      longitude,
    );

    // Hassas kullanıcı verilerini yanıttan filtreleme
    if (response && response.user) {
      // Doğrudan nesneden hassas bilgileri kaldırma
      const user = response.user as any;
      delete user.refreshToken;
      delete user.passwordHash;
      delete user.role;
    }

    return response;
  }
}
