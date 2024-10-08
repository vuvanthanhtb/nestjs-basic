import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionSchema } from './schema/permission.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Permission', schema: PermissionSchema },
    ]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
})
export class PermissionsModule {}
