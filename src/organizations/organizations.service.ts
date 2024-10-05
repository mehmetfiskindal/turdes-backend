// OrganizationsService (organizations/organizations.service.ts)
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Organization } from './models/organization.model';
import { OrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization)
    private readonly organizationModel: typeof Organization,
  ) {}

  async findAll(): Promise<Organization[]> {
    return this.organizationModel.findAll();
  }

  async create(organizationDto: OrganizationDto): Promise<Organization> {
    return this.organizationModel.create({
      name: organizationDto.name,
      address: organizationDto.address,
      contactInfo: organizationDto.contactInfo,
    });
  }
}
