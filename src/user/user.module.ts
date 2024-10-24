import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../db/entities/user.entity';
import { Role } from '../db/entities/role.entity';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    DbModule, // Добавьте DbModule здесь
  ],
  providers: [UserService], // Убедитесь, что UsersRepository не добавлен
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
