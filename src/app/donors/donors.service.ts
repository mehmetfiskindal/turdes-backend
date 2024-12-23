import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonorDto } from './dto/create-donor.dto';

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDonorDto: CreateDonorDto) {
    return this.prisma.donor.create({
      data: createDonorDto,
    });
  }

  async findOne(id: number) {
    return this.prisma.donor.findUnique({
      where: { id: Number(id) },
    });
  }

  async findDonations(id: number) {
    return this.prisma.donation.findMany({
      where: { donorId: Number(id) },
    });
  }
}
