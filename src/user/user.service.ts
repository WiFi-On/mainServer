import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../db1/repositories/users.repository';
import { User } from '../db1/entities/user.entity';
import * as bcrypt from 'bcryptjs'; // Изменение bcrypt на bcryptjs
@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // Функция для получения пользователя по email
  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.getUserByEmail(email);
  }
  // Функция для получения всех пользователей
  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.getAllUsers();
  }

  // Функция для создания пользователя
  async createUser(email: string, password: string): Promise<User> {
    const hashPassword = await bcrypt.hash(password, 10);
    const dateNow = new Date();
    const token = '';
    const tokenLifetime = new Date(dateNow.setDate(dateNow.getDate() + 30));
    const role = 'user';

    return this.usersRepository.createUser(email, hashPassword, role, token, tokenLifetime);
  }

  async updateTokenLifetime(userId: number, token: string, tokenLifetime: Date) {
    await this.usersRepository.updateTimeToken(userId, token, tokenLifetime);
  }
}
