import { Controller, Body, Post, UseGuards, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response as Res } from 'express';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { LoginResponseDto } from './dtos/login.dto';
import { HttpStatus } from '@nestjs/common/enums';
import { Logger } from '@nestjs/common/services';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Получение токена пользователя.' })
  @ApiOkResponse({ description: 'Токен успешно получен.', type: LoginResponseDto })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Response() res): Promise<void> {
    try {
      const { token } = await this.authService.login(req.user);

      if (!token) {
        this.logger.error('Не удалось сгенерировать токен для пользователя.');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Не удалось сгенерировать токен. Попробуйте позже.',
        });
      }

      res.cookie('token', token, { httpOnly: true });

      return res.status(HttpStatus.OK).json(new LoginResponseDto(token));
    } catch (error) {
      this.logger.error('Ошибка входа пользователя.', error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Произошла ошибка при обработке вашего запроса.',
      });
    }
  }

  @ApiOperation({ summary: 'Регистрация нового пользователя и получение токена.' })
  @ApiCreatedResponse({ description: 'Пользователь зарегистрирован и токен успешно получен.', type: LoginResponseDto })
  @Post('register')
  async register(@Body() body: { email: string; password: string }, @Response() res: Res): Promise<any> {
    try {
      const { token } = await this.authService.register(body.email, body.password);

      if (!token) {
        this.logger.error('Не удалось сгенерировать токен после успешной регистрации.');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Не удалось сгенерировать токен. Попробуйте позже.',
        });
      }

      return res.status(HttpStatus.CREATED).json(new LoginResponseDto(token));
    } catch (error) {
      this.logger.error('Ошибка при регистрации пользователя.', error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Произошла ошибка при обработке вашего запроса.',
      });
    }
  }
}
