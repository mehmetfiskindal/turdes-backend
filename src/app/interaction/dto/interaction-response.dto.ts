import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';

export class InteractionResponseDto {
  @ApiProperty({
    description: "Etkileşim ID'si",
    example: '5f7d8a9b-1c2d-3e4f-5g6h-7i8j9k0l1m2n',
  })
  id: string;

  @ApiProperty({
    description: 'Etkileşim tipi',
    enum: InteractionType,
    example: 'MEETING',
  })
  type: InteractionType;

  @ApiProperty({
    description: 'Etkileşim tarihi',
    example: '2025-04-12T10:00:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Etkileşim notları',
    example: 'Görüşmede proje detayları konuşuldu',
  })
  notes: string;

  @ApiProperty({
    description: "Etkileşimi kaydeden kullanıcının ID'si",
    example: '5f7d8a9b-1c2d-3e4f-5g6h-7i8j9k0l1m2n',
    nullable: true,
  })
  recordedByUserId: string | null;

  @ApiProperty({
    description: "Paydaş ID'si",
    example: '5f7d8a9b-1c2d-3e4f-5g6h-7i8j9k0l1m2n',
  })
  stakeholderId: string;

  @ApiProperty({
    description: 'Etkileşim oluşturulma zamanı',
    example: '2025-04-12T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Etkileşim son güncelleme zamanı',
    example: '2025-04-12T10:45:00.000Z',
  })
  updatedAt: Date;
}
