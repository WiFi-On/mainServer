import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../db1/entities/user.entity';
import { Role } from '../db1/entities/role.entity';
import { DbModule1 } from 'src/db1/db.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    DbModule1, // Добавьте DbModule здесь
  ],
  providers: [UserService], // Убедитесь, что UsersRepository не добавлен
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
