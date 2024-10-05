// App Module (app.module.ts)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { AidRequestsModule } from './aid-requests/aid-requests.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { User } from './models/user.model';
import { AidRequest } from './aid-requests/models/aid-request.model';
import { Organization } from './organizations/models/organization.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      autoLoadModels: true,
      synchronize: true,
      uri: process.env.DB_CONNECTION_STRING,
      models: [User, AidRequest, Organization],
    }),
    AuthModule,
    AidRequestsModule,
    OrganizationsModule,
  ],
})
export class AppModule {}
