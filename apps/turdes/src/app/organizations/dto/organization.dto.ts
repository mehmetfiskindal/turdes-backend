import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class OrganizationDto {
  @ApiProperty({
    example: 'Helping Hands',
    description: 'The name of the organization',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'The address of the organization',
  })
  @IsString()
  @IsOptional()
  readonly address?: string;

  @ApiProperty({
    example: 'contact@helpinghands.org',
    description: 'Contact information for the organization',
  })
  @IsString()
  @IsOptional()
  readonly contactInfo?: string;
}
