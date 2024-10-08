import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@users/schemas/user.schema';
import { RoleSchema } from 'roles/schema/role.schema';
import { PermissionSchema } from 'permissions/schema/permission.schema';
import { UsersService } from '@users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Role', schema: RoleSchema },
      { name: 'Permission', schema: PermissionSchema },
    ]),
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService, UsersService],
})
export class DatabasesModule {}
