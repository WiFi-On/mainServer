import { Controller, Body, Post, UseGuards, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response as Res } from 'express';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { LoginResponseDto } from './dtos/login.dto';
import { HttpStatus } from '@nestjs/common/enums';
import { LoggerService } from 'src/logger/logger.service';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({ summary: 'Получение токена пользователя.' })
  @ApiOkResponse({ description: 'Токен успешно получен.', type: LoginResponseDto })
  @ApiNotFoundResponse({ description: 'Пользователь не найден.' })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Response() res): Promise<void> {
    const clientIp = req.ip || req.socket.remoteAddress;
    const startTime = Date.now();

    try {
      const { token } = await this.authService.login(req.user);

      if (!token) {
        this.logger.error('Не удалось сгенерировать токен для пользователя.', 'AuthController/login', 'Не удалось сгенерировать токен для пользователя.', {
          ip: clientIp,
          time: `${Date.now() - startTime} мс`,
        });
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Не удалось сгенерировать токен. Попробуйте позже.',
        });
      }

      this.logger.log('Токен успешно получен.', 'AuthController/login', { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return res.status(HttpStatus.OK).json(new LoginResponseDto(token));
    } catch (error) {
      this.logger.error('Ошибка при получении токена.', 'AuthController/login', error.message, { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Произошла ошибка при обработке вашего запроса.',
      });
    }
  }

  @ApiOperation({ summary: 'Регистрация нового пользователя и получение токена.' })
  @ApiCreatedResponse({ description: 'Пользователь зарегистрирован и токен успешно получен.', type: LoginResponseDto })
  @Post('register')
  async register(@Request() req, @Body() body: { email: string; password: string }, @Response() res: Res): Promise<any> {
    const clientIp = req.ip || req.socket.remoteAddress;
    const startTime = Date.now();

    try {
      const { token } = await this.authService.register(body.email, body.password);

      if (!token) {
        this.logger.error('Не удалось сгенерировать токен для пользователя.', 'AuthController/register', 'Не удалось сгенерировать токен для пользователя.', {
          ip: clientIp,
          time: `${Date.now() - startTime} мс`,
        });
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Не удалось сгенерировать токен. Попробуйте позже.',
        });
      }

      this.logger.log('Пользователь зарегистрирован и токен успешно получен.', 'AuthController/register', { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return res.status(HttpStatus.CREATED).json(new LoginResponseDto(token));
    } catch (error) {
      this.logger.error('Ошибка при получении токена для пользователя.', 'AuthController/register', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Произошла ошибка при обработке вашего запроса.',
      });
    }
  }
}
