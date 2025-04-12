import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ description: 'Görev başlığı', example: 'Paydaş ile toplantı' })
  @IsNotEmpty({ message: 'Görev başlığı zorunludur' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Görev açıklaması', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Son tarih',
    required: false,
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiProperty({
    description: 'Görev durumu',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Görev önceliği',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Paydaş ID',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  stakeholderId?: string;

  @ApiProperty({
    description: 'Atanan kullanıcı ID',
    required: false,
    type: Number,
  })
  @IsOptional()
  assignedUserId?: number;
}
