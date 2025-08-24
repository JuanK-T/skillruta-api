import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { RefreshJwtStrategy } from './infrastructure/refresh.strategy';
import { AuthCookieService } from './infrastructure/auth-cookie.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        // el JwtService usará este secret por defecto; en service pasamos secrets explícitos igual
        secret: cfg.get<string>('JWT_ACCESS_SECRET') ?? 'fallback-secret',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, AuthCookieService],
  exports: [AuthService],
})
export class AuthModule {}
