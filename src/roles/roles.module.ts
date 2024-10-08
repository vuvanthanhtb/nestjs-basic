import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleSchema } from './schema/role.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Role', schema: RoleSchema }])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
