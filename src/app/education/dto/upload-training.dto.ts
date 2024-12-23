import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class UploadTrainingDto {
  @ApiProperty({ example: 'Training Title', description: 'Title of the training material' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Training Description', description: 'Description of the training material' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'http://example.com/training.mp4', description: 'URL of the training material' })
  @IsUrl()
  fileUrl: string;

  @ApiProperty({ example: 'video', description: 'Type of the training material (e.g., video, document)' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'http://example.com/training.mp4', description: 'URL of the training material' })
  @IsUrl()
  url: string;
}
