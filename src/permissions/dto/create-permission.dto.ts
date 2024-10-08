import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'name not empty' })
  name: string;

  @IsNotEmpty({ message: 'apiPath not empty' })
  apiPath: string;

  @IsNotEmpty({ message: 'method not empty' })
  method: string;

  @IsNotEmpty({ message: 'module not empty' })
  module: string;
}
