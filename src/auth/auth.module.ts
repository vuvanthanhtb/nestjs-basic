import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import ms from 'ms';
import { UsersModule } from '@users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { RolesModule } from 'roles/roles.module';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    UsersModule,
    PassportModule,
    RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: ms(configService.get<string>('JWT_ACCESS_EXPIRE')) / 1000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
