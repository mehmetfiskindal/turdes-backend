import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CustomFieldValueDto {
  @ApiProperty({ description: 'Özel alan adı', example: 'İletişim Tercihi' })
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @ApiProperty({ description: 'Özel alan değeri', example: 'E-posta' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
