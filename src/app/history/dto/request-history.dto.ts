import { ApiProperty } from '@nestjs/swagger';

export class RequestHistoryDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  organizationId: number;

  @ApiProperty()
  requests: any[];
}
