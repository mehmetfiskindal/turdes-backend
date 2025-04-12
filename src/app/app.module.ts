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

import { HistoryModule } from './history/history.module';
import { FaqModule } from './faq/faq.module';
import { EducationModule } from './education/education.module';
import { DonorsModule } from './donors/donors.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MapModule } from './map/map.module';
import { StakeholderModule } from './stakeholder/stakeholder.module';
import { InteractionModule } from './interaction/interaction.module';
import { CampaignModule } from './campaign/campaign.module';
import { CustomFieldModule } from './custom-field/custom-field.module';
import { TaskModule } from './task/task.module';
import { TaskService } from './task/task.service';
import { TaskController } from './task/task.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development.local', '.env.development'],
    }),
    AuthModule,
    AidRequestsModule,
    OrganizationsModule,
    CaslModule,
    DashboardModule,
    VolunteersModule,
    SecurityModule,
    ReportsModule,
    HistoryModule,
    FaqModule,
    EducationModule,
    DonorsModule,
    CampaignModule,
    MapModule,
    StakeholderModule,
    InteractionModule,
    DonorsModule,
    CustomFieldModule,
    TaskModule,
  ],
  controllers: [AppController, TaskController],
  providers: [AppService, PrismaService, TaskService],
})
export class AppModule {}
