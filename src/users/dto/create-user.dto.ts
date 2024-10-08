import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
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

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name not empty' })
  name: string;

  @IsEmail({}, { message: 'Email invalid' })
  @IsNotEmpty({ message: 'Email not empty' })
  email: string;

  @IsNotEmpty({ message: 'Password not empty' })
  password: string;

  @IsNotEmpty({ message: 'Age not empty' })
  age: number;

  @IsNotEmpty({ message: 'Gender not empty' })
  gender: string;

  @IsNotEmpty({ message: 'Address not empty' })
  address: string;

  @IsNotEmpty({ message: 'role not empty' })
  @IsMongoId({ message: 'role must be a valid MongoDB ObjectId' })
  role: mongoose.Schema.Types.ObjectId;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name not empty' })
  name: string;

  @IsEmail({}, { message: 'Email invalid' })
  @IsNotEmpty({ message: 'Email not empty' })
  email: string;

  @IsNotEmpty({ message: 'Password not empty' })
  password: string;

  @IsNotEmpty({ message: 'Age not empty' })
  age: number;

  @IsNotEmpty({ message: 'Gender not empty' })
  gender: string;

  @IsNotEmpty({ message: 'Address not empty' })
  address: string;
}

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'admin@mail.com', description: 'username' })
  readonly username: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: 'password',
  })
  readonly password: string;
}
