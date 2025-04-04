import { ApiProperty } from '@nestjs/swagger';

export class OrganizationRatingDto {
  @ApiProperty({ description: 'Organization ID' })
  organizationId: number;

  @ApiProperty({ description: 'Rating value (1-5)' })
  rating: number;

  @ApiProperty({ description: 'Feedback comment' })
  feedback: string;

  @ApiProperty({ description: 'User ID providing the rating' })
  userId: number;

  @ApiProperty({
    description: 'Whether the rating should be anonymous',
    required: false,
    default: false,
  })
  anonymous?: boolean;
}
