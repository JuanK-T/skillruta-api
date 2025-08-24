import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Role, UserPayload } from '../../../common/types';

/** Extractor seguro para la cookie del access token */
function accessCookieExtractor(req: Request): string | null {
  const requestWithCookies = req as unknown as { cookies?: { sr_at?: string } };
  return requestWithCookies.cookies?.sr_at ?? null;
}

/** Forma del payload que firmamos para el access token */
type AccessJwtPayload = {
  sub: string;
  email: string;
  role: Role;
  tv?: number; // tokenVersion (opcional)
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([accessCookieExtractor]),
      secretOrKey: cfg.get<string>('JWT_ACCESS_SECRET') || 'fallback-secret',
      ignoreExpiration: false,
    });
  }

  /** Mapea el payload del JWT a tu UserPayload tipado para req.user */
  validate(payload: AccessJwtPayload): UserPayload {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
