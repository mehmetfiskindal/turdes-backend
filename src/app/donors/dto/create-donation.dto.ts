import { ApiProperty } from '@nestjs/swagger';

export class CreateDonationDto {
  @ApiProperty({ description: 'Donation amount' })
  amount: number;

  @ApiProperty({ description: 'ID of the donor' })
  donorId: number;

  @ApiProperty({ description: 'ID of the user receiving the donation' })
  userId: number;

  @ApiProperty({ description: 'Whether the donation should be anonymous', required: false, default: false })
  anonymous?: boolean;
}