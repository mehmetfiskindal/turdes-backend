// Organizations Module (organizations/organizations.module.ts)
import { Module } from '@nestjs/common';

import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  providers: [OrganizationsService, PrismaService],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
