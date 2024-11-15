import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// entities

// repositories

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [],
  exports: [],
})
export class DbModule2 {}
