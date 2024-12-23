import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty()
  @IsNumber()
  readonly volunteerId: number;

  @ApiProperty()
  @IsNumber()
  readonly taskId: number;
}
