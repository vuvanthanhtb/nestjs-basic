import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'name not empty' })
  name: string;

  @IsNotEmpty({ message: 'description not empty' })
  description: string;

  @IsNotEmpty({ message: 'isActive not empty' })
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive: boolean;

  @IsNotEmpty({ message: 'permissions not empty' })
  @IsMongoId({ message: 'permissions must be a valid MongoDB ObjectId' })
  @IsArray({ message: 'permissions must be an array' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
