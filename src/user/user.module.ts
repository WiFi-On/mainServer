import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DbModule1 } from '../db1/db1.module';

@Module({
  imports: [DbModule1],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
