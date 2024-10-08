import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './user.interface';
import aqp from 'api-query-params';
import { RoleDocument } from 'roles/schema/role.schema';
import { USER_ROLE } from 'databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel('Role')
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  hashPassword = (password: string) => {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  };

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { name, email, password, age, gender, address, role, company } =
      createUserDto;
    const isExistEmail = await this.userModel.findOne({ email });
    if (isExistEmail) {
      throw new BadRequestException(`Email::${email} already exists`);
    }
    const hashPassword = this.hashPassword(password);
    const newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password, age, gender, address } = registerUserDto;
    const isExistEmail = await this.userModel.findOne({ email });
    if (isExistEmail) {
      throw new BadRequestException(`Email::${email} already exists`);
    }

    const userRole = await this.roleModel.findOne({ name: USER_ROLE });
    const hashPassword = this.hashPassword(password);
    return await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: userRole?._id,
    });
  }

  async findByEmail(email: string) {
    return await this.userModel
      .findOne({ email })
      .populate({ path: 'role', select: { name: 1 } });
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
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
      throw new NotFoundException(`User not found with id::${id}`);
    }
    return await this.userModel
      .findOne({ _id: id })
      .select('-password')
      .populate({ path: 'role', select: { _id: 1, name: 1 } });
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(updateUserDto.id)) {
      throw new NotFoundException(
        `User not found with id::${updateUserDto.id}`,
      );
    }
    return await this.userModel
      .updateOne(
        { _id: updateUserDto.id },
        {
          ...updateUserDto,
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
      throw new NotFoundException(`User not found with id::${id}`);
    }

    const foundUser = await this.userModel.findById(id);
    if (foundUser.email === 'admin@mail.com') {
      throw new BadRequestException(
        `Unable to delete account::${foundUser.email}`,
      );
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.userModel.softDelete({ _id: id });
  }

  updateUserToken = (refreshToken: string, _id: string) => {
    return this.userModel.updateOne({ _id }, { refreshToken });
  };

  findUserByRefreshToken = (refreshToken: string) => {
    return this.userModel
      .findOne({ refreshToken })
      .populate({ path: 'role', select: { name: 1 } });
  };
}
