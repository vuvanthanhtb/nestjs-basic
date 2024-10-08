import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'Name not empty' })
  name: string;

  @IsEmail({}, { message: 'Email invalid' })
  @IsNotEmpty({ message: 'Email not empty' })
  email: string;

  @IsNotEmpty({ message: 'skills not empty' })
  @IsArray({ message: 'skills must be array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills: string[];
}
