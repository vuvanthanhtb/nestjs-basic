import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CompaniesService } from '~companies/companies.service';
import { CompaniesController } from '~companies/companies.controller';
import { CompanySchema } from '~companies/schema/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema }]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
