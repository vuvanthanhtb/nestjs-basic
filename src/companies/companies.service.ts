import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

import { IUser } from '@users/user.interface';

import { CreateCompanyDto } from '~companies/dto/create-company.dto';
import { UpdateCompanyDto } from '~companies/dto/update-company.dto';
import { CompanyDocument } from '~companies/schema/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel('Company')
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  create(createCompanyDto: CreateCompanyDto, user: IUser) {
    return this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    let { sort }: { sort: any } = aqp(qs);
    console.log({ sort });

    // if (isEmpty(sort)) {
    //   sort = '-updatedAt';
    // }

    const result = await this.companyModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Company not found with id::${id}`);
    }
    return this.companyModel.findById({ _id: id }).exec();
  }

  update(updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(updateCompanyDto.id)) {
      throw new NotFoundException(
        `Company not found with id::${updateCompanyDto.id}`,
      );
    }

    return this.companyModel
      .updateOne(
        { _id: updateCompanyDto.id },
        {
          ...updateCompanyDto,
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
      throw new NotFoundException(`Company not found with id::${id}`);
    }

    await this.companyModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return await this.companyModel.softDelete({ _id: id });
  }
}
