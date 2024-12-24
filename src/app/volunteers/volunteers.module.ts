import { Module } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [VolunteersService, PrismaService],
  controllers: [VolunteersController],
})
export class VolunteersModule {}
