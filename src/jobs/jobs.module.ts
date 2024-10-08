import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSchema } from './schema/job.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Jobs', schema: JobSchema }])],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
