import {
  Controller,
  Body,
  Post,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response as Res } from 'express';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Response() res: Res) {
    const { token } = await this.authService.login(req.user);
    res.cookie('token', token, {
      httpOnly: false, // Запретить доступ через JavaScript
      secure: process.env.NODE_ENV === 'production', // Только для HTTPS в продакшене
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });
    return res.status(200).json({ token: token });
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string },
    @Response() res: Res,
  ): Promise<any> {
    const { token } = await this.authService.register(
      body.email,
      body.password,
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 день
    });
    return res.status(201).json({ message: 'Регистрация успешна' });
  }
}
