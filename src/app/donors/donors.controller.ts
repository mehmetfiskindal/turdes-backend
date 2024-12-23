import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { CreateDonorDto } from './dto/create-donor.dto';

@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post()
  async create(@Body() createDonorDto: CreateDonorDto) {
    return this.donorsService.create(createDonorDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.donorsService.findOne(id);
  }

  @Get(':id/donations')
  async findDonations(@Param('id') id: number) {
    return this.donorsService.findDonations(id);
  }
}
