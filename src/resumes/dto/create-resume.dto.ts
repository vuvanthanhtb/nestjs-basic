import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsEmail({}, { message: 'Email invalid' })
  @IsNotEmpty({ message: 'Email not empty' })
  email: string;

  @IsNotEmpty({ message: 'Password not empty' })
  @IsMongoId({ message: 'userId must be a valid MongoDB ObjectId' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'url not empty' })
  url: string;

  @IsNotEmpty({ message: 'status not empty' })
  status: string;

  @IsNotEmpty({ message: 'companyId not empty' })
  @IsMongoId({ message: 'companyId must be a valid MongoDB ObjectId' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'jobId not empty' })
  @IsMongoId({ message: 'jobId must be a valid MongoDB ObjectId' })
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateResumeCvDto {
  @IsNotEmpty({ message: 'url not empty' })
  url: string;

  @IsNotEmpty({ message: 'companyId not empty' })
  @IsMongoId({ message: 'companyId must be a valid MongoDB ObjectId' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'jobId not empty' })
  @IsMongoId({ message: 'jobId must be a valid MongoDB ObjectId' })
  jobId: mongoose.Schema.Types.ObjectId;
}
