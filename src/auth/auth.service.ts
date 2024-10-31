// src/auth/auth.service.ts
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { UserI } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Проверка активности пользователя
    if (!user.is_active) {
      throw new UnauthorizedException('Пользователь не активен');
    }

    const { password, role, ...result } = user; // Получаем роль
    if (await bcrypt.compare(pass, password)) {
      return {
        ...result,
        role: role?.role, // Возвращаем только название роли
      };
    }

    throw new UnauthorizedException('Неверный пароль');
  }
  async login(user: UserI) {
    const { id, email, role, is_active, partner_id } = user;
    let expiresIn: string;
    switch (role) {
      case 'admin':
        expiresIn = '30d';
        break;
      case 'user':
        expiresIn = '30d';
        break;
      case 'partnerAvatell':
        expiresIn = '365d';
        break;
      case 'superuser':
        expiresIn = '1d';
        break;
      default:
        expiresIn = '30d'; // Значение по умолчанию
    }

    // Создание токена с заданным временем жизни
    const token = await this.jwtService.signAsync(
      { id, email, role, is_active, partner_id },
      { expiresIn },
    );

    // Установка времени жизни токена
    const tokenLifetime = new Date();
    tokenLifetime.setDate(
      tokenLifetime.getDate() + Number(expiresIn.slice(0, -1)),
    );

    // Обновление времени жизни токена в базе данных
    await this.userService.updateTokenLifetime(id, token, tokenLifetime);

    return {
      token,
    };
  }
  async register(email: string, password: string): Promise<any> {
    const existingUser = await this.userService.getUserByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException(
        'Пользователь с таким email уже существует',
      );
    }

    // Создаем пользователя без токена
    const user = await this.userService.createUser(email, password);
    const role = 'user';

    // Генерация токена
    const token = await this.jwtService.signAsync(
      { id: user.id, email: user.email, role, isActive: false },
      { expiresIn: '1d' }, // Время жизни токена
    );

    // Установка времени жизни токена
    const tokenLifetime = new Date();
    tokenLifetime.setDate(tokenLifetime.getDate() + 1); // Устанавливаем время жизни на 30 дней

    // Обновляем пользователя с новым токеном
    await this.userService.updateTokenLifetime(user.id, token, tokenLifetime);

    return {
      token,
    };
  }
}
