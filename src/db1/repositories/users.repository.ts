import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Функция для получения пользователя по id
  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      return user;
    } catch (error) {
      console.error('Ошибка при получении пользователя по ID:', error);
      throw error;
    }
  }
  // Функция для получения пользователя по email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'], // Добавьте это, чтобы загрузить роль пользователя
      });
      return user;
    } catch (error) {
      console.error('Ошибка при получении пользователя по email:', error);
      throw error;
    }
  }

  // Функция для получения всех пользователей
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      console.error('Ошибка при получении всех пользователей:', error);
      throw error;
    }
  }
  // Функция для создания пользователя
  async createUser(
    email: string,
    hashPassword: string,
    roleName: string,
    token: string,
    tokenLifetime: Date,
    active = false,
  ): Promise<User> {
    try {
      // Получаем роль по имени
      const role = await this.roleRepository.findOne({
        where: { role: roleName },
      }); // Измените на поиск по имени роли
      if (!role) {
        throw new Error('Роль не найдена');
      }

      const newUser = {
        email,
        password: hashPassword,
        is_active: active,
        role, // Здесь назначаем найденную роль
        token,
        token_lifetime: tokenLifetime, // Добавление времени жизни токена
        created_at: new Date(),
      };

      return await this.userRepository.save(newUser);
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }

  // Функция для обновления токена пользователя
  async updateTimeToken(id: number, token: string, token_lifetime: Date): Promise<void> {
    try {
      await this.userRepository.update({ id }, { token, token_lifetime });
    } catch (error) {
      console.error('Ошибка при обновлении токена пользователя:', error);
      throw error;
    }
  }
}
