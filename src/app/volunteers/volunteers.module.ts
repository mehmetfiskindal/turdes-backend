import { Module } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';

@Module({
  imports: [],
  providers: [VolunteersService],
  controllers: [VolunteersController],
})
export class VolunteersModule {}
