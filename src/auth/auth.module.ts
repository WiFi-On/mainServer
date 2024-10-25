// src/auth/auth.module.ts
// nest
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
// service
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
// strategy
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
// controller
import { AuthController } from './auth.controller';
// module
import { DadataModule } from 'src/dadata/dadata.module';
import { DbModule } from 'src/db/db.module';
import { UserModule } from '../user/user.module';

// src/auth/auth.module.ts
@Module({
  imports: [
    UserModule,
    DadataModule,
    PassportModule,
    DbModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ConfigService,
    UserService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}