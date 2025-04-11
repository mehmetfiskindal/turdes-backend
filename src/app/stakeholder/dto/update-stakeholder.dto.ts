import { PartialType } from '@nestjs/swagger'; // Swagger'dan import ediyoruz
import { CreateStakeholderDto } from './create-stakeholder.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStakeholderDto extends PartialType(CreateStakeholderDto) {
  @ApiProperty({
    description: 'Güncelleme tarihi (otomatik olarak set edilir)',
    example: '2025-04-11T14:32:22Z',
    required: false,
    readOnly: true,
  })
  updatedAt?: Date;
}
