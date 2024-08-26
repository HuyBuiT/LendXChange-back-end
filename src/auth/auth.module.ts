import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountModule } from 'src/account/account.module';
import { cacheModule } from '../config/config.cache';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy, ResfreshTokenStrategy } from './auth.strategy';

@Module({
  imports: [cacheModule, JwtModule.register({}), PassportModule, AccountModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, ResfreshTokenStrategy],
})
export class AuthModule {}
