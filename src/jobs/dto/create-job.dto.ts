import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty({ message: 'Id not empty' })
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Name not empty' })
  name: string;
}

export class CreateJobDto {
  name: string;

  @IsNotEmpty({ message: 'skills not empty' })
  @IsArray({ message: 'skills must be array' })
  @IsString({ each: true, message: 'skill must be string' })
  skills: string[];

  @IsNotEmpty({ message: 'location not empty' })
  location: string;

  @IsNotEmpty({ message: 'salary not empty' })
  salary: number;

  @IsNotEmpty({ message: 'quantity not empty' })
  quantity: number;

  @IsNotEmpty({ message: 'level not empty' })
  level: string;

  @IsNotEmpty({ message: 'description not empty' })
  description: string;

  @IsNotEmpty({ message: 'startDate not empty' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'startDate must be date' })
  startDate: Date;

  @IsNotEmpty({ message: 'endDate not empty' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'endDate must be date' })
  endDate: Date;

  @IsNotEmpty({ message: 'isActive not empty' })
  @IsBoolean({ message: 'isActive must be boolean' })
  isActive: boolean;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}
