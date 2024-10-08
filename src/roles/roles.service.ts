import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDocument } from './schema/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '@users/user.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { ADMIN_ROLE } from 'databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel('Role')
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = createRoleDto;
    const isExist = await this.roleModel.findOne({ name }).exec();
    if (isExist) {
      throw new NotFoundException(`Role::${name} already exists`);
    }

    const newRole = await this.roleModel.create({
      name,
      description,
      isActive,
      permissions,
      createdBy: { _id: user._id, email: user.email },
    });
    return {
      _id: newRole._id,
      createdAt: newRole.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel
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
      throw new NotFoundException(`Role not found with id::${id}`);
    }
    return (await this.roleModel.findById(id)).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Role not found with id::${id}`);
    }
    const { name, description, isActive, permissions } = updateRoleDto;
    // const isExist = await this.roleModel.findOne({ name }).exec();
    // if (isExist) {
    //   throw new NotFoundException(`Role::${name} already exists`);
    // }
    return await this.roleModel.updateOne(
      { _id: id },
      {
        name,
        description,
        isActive,
        permissions,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Role not found with id::${id}`);
    }

    const foundRole = await this.roleModel.findById(id);
    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException(`Unable to delete role::${foundRole.name}`);
    }
    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.roleModel.softDelete({ _id: id });
  }
}
