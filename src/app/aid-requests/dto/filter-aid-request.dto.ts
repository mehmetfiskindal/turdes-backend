import { ApiProperty } from '@nestjs/swagger';

export class FilterAidRequestDto {
  @ApiProperty({
    description: 'Filter by type of aid request',
    required: false,
  })
  type?: string;

  @ApiProperty({ description: 'Filter by status', required: false })
  status?: string;

  @ApiProperty({
    description: 'Filter by latitude center point',
    required: false,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Filter by longitude center point',
    required: false,
  })
  longitude?: number;

  @ApiProperty({
    description: 'Search radius in kilometers',
    required: false,
    default: 10,
  })
  radiusKm?: number;

  @ApiProperty({
    description: 'Filter for urgent requests only',
    required: false,
    default: false,
  })
  urgentOnly?: boolean;

  @ApiProperty({
    description: 'Filter by user category (ELDERLY, DISABLED, etc.)',
    required: false,
  })
  userCategory?: string;

  @ApiProperty({
    description: 'Filter for recurring requests only',
    required: false,
  })
  recurring?: boolean;

  @ApiProperty({
    description: 'Filter for verified requests only',
    required: false,
  })
  verifiedOnly?: boolean;

  @ApiProperty({ description: 'Search term for description', required: false })
  searchTerm?: string;

  @ApiProperty({
    description: 'Minimum date for aid request (YYYY-MM-DD)',
    required: false,
  })
  dateFrom?: string;

  @ApiProperty({
    description: 'Maximum date for aid request (YYYY-MM-DD)',
    required: false,
  })
  dateTo?: string;

  @ApiProperty({
    description: 'Sort field (createdAt, status, etc.)',
    required: false,
    default: 'createdAt',
  })
  sortBy?: string;

  @ApiProperty({
    description: 'Sort direction (asc or desc)',
    required: false,
    default: 'desc',
  })
  sortDirection?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'Items per page for pagination',
    required: false,
    default: 10,
  })
  limit?: number;
}
