// AidRequestsService (aid-requests/aid-requests.service.ts)
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AidRequest } from './models/aid-request.model';
import { AidRequestDto } from './dto/aid-request.dto';

@Injectable()
export class AidRequestsService {
  constructor(
    @InjectModel(AidRequest)
    private readonly aidRequestModel: typeof AidRequest,
  ) {}

  async findAll(): Promise<AidRequest[]> {
    return this.aidRequestModel.findAll();
  }

  async findOne(aidRequestId: number): Promise<AidRequest> {
    return this.aidRequestModel.findOne({
      where: { id: aidRequestId },
    });
  }

  async create(aidRequestDto: AidRequestDto): Promise<AidRequest> {
    return this.aidRequestModel.create({
      userId: aidRequestDto.userId,
      type: aidRequestDto.type,
      description: aidRequestDto.description,
      status: 'pending',
    });
  }
}
