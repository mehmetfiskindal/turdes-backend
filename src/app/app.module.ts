import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AidRequestsModule } from './aid-requests/aid-requests.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from './casl/casl.module';
import { PrismaService } from './prisma/prisma.service';
import { VolunteersModule } from './volunteers/volunteers.module';
import { SecurityModule } from './security/security.module';
import { ReportsModule } from './reports/reports.module';
import { MapModule } from './map/map.module';
import { HistoryModule } from './history/history.module';
import { FaqModule } from './faq/faq.module';
import { EducationModule } from './education/education.module';
import { DonorsModule } from './donors/donors.module';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development.local', '.env.development'],
    }),
    AuthModule,
    AidRequestsModule,
    OrganizationsModule,
    CaslModule,
    VolunteersModule,
    SecurityModule,
    ReportsModule,
    MapModule,
    HistoryModule,
    FaqModule,
    EducationModule,
    DonorsModule,
    CampaignsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
