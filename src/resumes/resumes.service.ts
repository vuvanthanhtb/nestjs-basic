import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ResumeDocument } from './schema/resume.schema';
import mongoose from 'mongoose';
import { IUser } from '@users/user.interface';
import aqp from 'api-query-params';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel('Resume')
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  async create(createResumeDto: CreateResumeDto, user: IUser) {
    const { url, companyId, jobId } = createResumeDto;
    const { _id, email } = user;
    const newCV = await this.resumeModel.create({
      url,
      companyId,
      jobId,
      createdBy: { _id, email },
      history: [
        { status: 'PENDING', updatedAt: new Date(), updatedBy: { _id, email } },
      ],
    });
    return {
      id: newCV?._id,
      createdAt: newCV?.createdAt,
    };
  }

  async getResumesByUser(user: IUser) {
    return await this.resumeModel
      .find({ userId: user._id })
      .sort('-createdAt')
      .populate([
        { path: 'companyId', select: { name: 1 } },
        { path: 'jobId', select: { name: 1 } },
      ]);
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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
      throw new NotFoundException(`Resume not found with id::${id}`);
    }
    return await this.resumeModel.findOne({ _id: id }).exec();
  }

  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Resume not found with id::${id}`);
    }

    return await this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        updatedBy: { _id: user._id, email: user.email },
        $push: {
          history: {
            status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Resume not found with id::${id}`);
    }
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.resumeModel.softDelete({ _id: id });
  }
}
