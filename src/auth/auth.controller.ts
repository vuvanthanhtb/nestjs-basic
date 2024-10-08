import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Res,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponseMessage, User } from 'decorator/customize';
import { RegisterUserDto, UserLoginDto } from '@users/dto/create-user.dto';
import { IUser } from '@users/user.interface';
import { RolesService } from 'roles/roles.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login success')
  @ApiBody({ type: UserLoginDto })
  @Post('/login')
  login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage('Register success')
  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage('Get profile success')
  @Get('/get-profile')
  async getProfile(@User() user: IUser) {
    const foundRole = (await this.rolesService.findOne(user.role._id)) as any;
    user.permissions = foundRole.permissions;
    return { user };
  }

  @Public()
  @ResponseMessage('Refresh token success')
  @Get('/refresh-token')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.createNewToken(refreshToken, response);
  }

  @ResponseMessage('Logout success')
  @Post('/logout')
  logout(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(user, response);
  }
}
