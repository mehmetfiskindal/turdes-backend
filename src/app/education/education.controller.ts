import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { EducationService } from './education.service';
import { UploadTrainingDto } from './dto/upload-training.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('education')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a training video or document' })
  @ApiResponse({
    status: 201,
    description: 'Successfully uploaded training video or document.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: UploadTrainingDto })
  @Post('upload')
  async uploadTraining(@Body() uploadTrainingDto: UploadTrainingDto) {
    return this.educationService.uploadTraining(uploadTrainingDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all training materials' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all training materials.',
  })
  @Get('all')
  async getAllTrainingMaterials() {
    return this.educationService.getAllTrainingMaterials();
  }
}
