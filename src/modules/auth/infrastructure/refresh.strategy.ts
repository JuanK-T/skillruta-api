import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { Role, UserPayload } from '../../../common/types';

function refreshCookieExtractor(req: Request): string | null {
  const requestWithCookies = req as unknown as { cookies?: { sr_rt?: string } };
  return requestWithCookies.cookies?.sr_rt ?? null;
}

type RefreshJwtPayload = {
  sub: string;
  email: string;
  role: Role;
  tv?: number;
  iat?: number;
  exp?: number;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(
    cfg: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([refreshCookieExtractor]),
      secretOrKey: cfg.get<string>('JWT_REFRESH_SECRET') || 'fallback-secret',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: RefreshJwtPayload
  ): Promise<UserPayload> {
    const token = refreshCookieExtractor(req);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!token || !user?.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    const ok = await bcrypt.compare(token, user.refreshTokenHash);
    if (!ok) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
    };
  }
}
