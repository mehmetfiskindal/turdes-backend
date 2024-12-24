import { Module } from '@nestjs/common';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [EducationService, PrismaService],
  controllers: [EducationController],
})
export class EducationModule {}
