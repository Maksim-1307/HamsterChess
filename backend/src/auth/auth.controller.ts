import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  clearAuthCookies,
  readRefreshToken,
  setAuthCookies,
} from './auth.cookies';
import type { AuthResult, PublicUser } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    return this.completeSession(this.authService.register(dto), res);
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    return this.completeSession(this.authService.login(dto), res);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    return this.completeSession(
      this.authService.refresh(readRefreshToken(req)),
      res,
    );
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(readRefreshToken(req));
    clearAuthCookies(res);
  }

  @Get('me')
  me(@CurrentUser() user: PublicUser): Promise<PublicUser> {
    return this.authService.getProfile(user.id);
  }

  private async completeSession(
    result: Promise<AuthResult>,
    res: Response,
  ): Promise<PublicUser> {
    const { user, tokens } = await result;
    setAuthCookies(res, tokens, this.authService.cookieOptions());
    return user;
  }
}
