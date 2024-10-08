import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from '@users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { JobDocument } from './schema/job.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel('Jobs')
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name,
      skills,
      company,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
    } = createJobDto;
    const newJob = await this.jobModel.create({
      name,
      skills,
      company,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newJob._id,
      name: newJob.name,
      createdBy: newJob.createdBy,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Job not found');
    }
    return await this.jobModel.findOne({ _id: id }).exec();
  }

  async update(updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(updateJobDto.id)) {
      throw new NotFoundException('Job not found');
    }
    return await this.jobModel
      .updateOne(
        { _id: updateJobDto.id },
        {
          ...updateJobDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      )
      .exec();
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Job not found');
    }
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.jobModel.softDelete({ _id: id });
  }
}
