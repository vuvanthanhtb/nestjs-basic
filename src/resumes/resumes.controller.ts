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
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResponseMessage, User } from 'decorator/customize';
import { IUser } from '@users/user.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessage('Resume created successfully')
  create(@Body() createResumeDto: CreateResumeDto, @User() user: IUser) {
    return this.resumesService.create(createResumeDto, user);
  }

  @Post('by-user')
  @ResponseMessage('Resumes found successfully')
  getResumesByUser(@User() user: IUser) {
    return this.resumesService.getResumesByUser(user);
  }

  @Get()
  @ResponseMessage('Resumes found successfully')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Resume found successfully')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Resume updated successfully')
  update(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage('Resume deleted successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
