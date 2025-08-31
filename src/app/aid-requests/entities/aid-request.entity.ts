import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class AidRequestEntity extends BaseEntity {
  @ApiProperty({ description: 'Yardım talebinin tipi' })
  type: string;

  @ApiProperty({ description: 'Yardım talebinin açıklaması' })
  description: string;

  @ApiProperty({ description: 'Durum', required: false })
  status?: string;

  @ApiProperty({ description: 'Kuruluş ID', required: false })
  organizationId?: number;

  @ApiProperty({ description: 'Kullanıcı ID' })
  userId: number;

  @ApiProperty({ description: 'Konum ID', required: false })
  locationId?: number;

  @ApiProperty({ description: 'Silinmiş mi?', default: false })
  isDeleted: boolean;

  @ApiProperty({ description: 'QR kod URL', required: false })
  qrCodeUrl?: string;

  @ApiProperty({ description: 'Acil mi?', default: false })
  isUrgent: boolean;

  @ApiProperty({ description: 'Tekrarlayan mı?', default: false })
  recurring: boolean;

  @ApiProperty({ description: 'Doğrulanmış mı?', default: false })
  verified: boolean;

  @ApiProperty({ description: 'Rapor edilmiş mi?', default: false })
  reported: boolean;

  @ApiProperty({ description: 'Yardım kodu', required: false })
  helpCode?: string;
}
