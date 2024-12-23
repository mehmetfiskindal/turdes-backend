import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  readonly documentName: string;

  @ApiProperty()
  @IsString()
  readonly documentUrl: string;
}
