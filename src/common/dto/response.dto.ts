import { ApiProperty } from '@nestjs/swagger';

export class CreateResponseDto<T> {
  @ApiProperty({ description: 'Oluşturulan kayıt' })
  data: T;

  @ApiProperty({ description: 'Başarı mesajı' })
  message: string;
}

export class UpdateResponseDto<T> {
  @ApiProperty({ description: 'Güncellenen kayıt' })
  data: T;

  @ApiProperty({ description: 'Başarı mesajı' })
  message: string;
}

export class DeleteResponseDto {
  @ApiProperty({ description: 'Başarı mesajı' })
  message: string;
}
