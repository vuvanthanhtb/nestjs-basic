import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ResponseMessage, User } from 'decorator/customize';
import { IUser } from '@users/user.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage('Job created successfully')
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @Get()
  @ResponseMessage('Jobs found successfully')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Job found successfully')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch()
  @ResponseMessage('Job updated successfully')
  update(@Body() updateJobDto: UpdateJobDto, @User() user: IUser) {
    return this.jobsService.update(updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Job deleted successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
