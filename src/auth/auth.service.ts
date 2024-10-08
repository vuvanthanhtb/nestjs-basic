import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

import { IUser } from '@users/user.interface';
import { UsersService } from '@users/users.service';
import { RegisterUserDto } from '@users/dto/create-user.dto';
import { REFRESH_TOKEN } from '~constants/constants';
import { RolesService } from 'roles/roles.service';

@Injectable()
export class AuthService {
  private expiresRefreshToken: number;
  private secretRefreshToken: string;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
  ) {
    this.expiresRefreshToken = ms(
      this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    );
    this.secretRefreshToken = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET_SECRET',
    );
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const foundRole = await this.rolesService.findOne(userRole._id);
        return {
          ...user.toObject(),
          permissions: foundRole.permissions ?? [],
        };
      }
    }
    return null;
  }

  async register(registerUserDto: RegisterUserDto) {
    const newUser = await this.usersService.register(registerUserDto);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;

    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refreshToken = this.createRefreshToken(
      payload,
      this.expiresRefreshToken,
    );
    await this.usersService.updateUserToken(refreshToken, _id);

    response.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      maxAge: this.expiresRefreshToken,
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      user: {
        _id,
        name,
        email,
        role,
        permissions,
      },
    };
  }

  createRefreshToken = (payload: any, expiresRefreshToken: number) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.secretRefreshToken,
      expiresIn: expiresRefreshToken / 1000,
    });

    return refreshToken;
  };

  createNewToken = async (_refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(_refreshToken, {
        secret: this.secretRefreshToken,
      });

      const user =
        await this.usersService.findUserByRefreshToken(_refreshToken);

      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };

        const refreshToken = this.createRefreshToken(
          payload,
          this.expiresRefreshToken,
        );
        await this.usersService.updateUserToken(refreshToken, _id.toString());

        const userRole = user.role as unknown as { _id: string; name: string };
        const foundRole = await this.rolesService.findOne(userRole._id);

        response.clearCookie(REFRESH_TOKEN);
        response.cookie(REFRESH_TOKEN, refreshToken, {
          httpOnly: true,
          maxAge: this.expiresRefreshToken,
        });

        return {
          access_token: this.jwtService.sign(payload),
          refresh_token: refreshToken,
          user: {
            _id,
            name,
            email,
            role,
            permissions: foundRole.permissions ?? [],
          },
        };
      }
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  };

  logout = async (user: IUser, response: Response) => {
    await this.usersService.updateUserToken('', user._id);
    response.clearCookie(REFRESH_TOKEN);
    return 'OK';
  };
}
