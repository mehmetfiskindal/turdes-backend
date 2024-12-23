import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsObject } from 'class-validator';

export class ReportDto {
  @ApiProperty({ example: 'aid', description: 'The type of the report' })
  @IsString()
  readonly type: string;

  @ApiProperty({ example: '2023-01-01', description: 'The start date of the report' })
  @IsDate()
  readonly startDate: Date;

  @ApiProperty({ example: '2023-12-31', description: 'The end date of the report' })
  @IsDate()
  readonly endDate: Date;

  @ApiProperty({ example: {}, description: 'The data of the report' })
  @IsObject()
  readonly data: object;
}
