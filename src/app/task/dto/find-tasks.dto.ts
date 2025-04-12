import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class FindTasksDto {
  @ApiProperty({
    description: 'Görev durumu filtresi',
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Görev önceliği filtresi',
    enum: TaskPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Paydaş ID ile filtreleme',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  stakeholderId?: string;

  @ApiProperty({
    description: 'Atanan kullanıcı ID ile filtreleme',
    required: false,
    type: Number,
  })
  @IsOptional()
  assignedUserId?: number;
}
