import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from '../types';

export const CurrentUser = createParamDecorator(
  (property: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as UserPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Si piden una propiedad específica, devuélvela tal cual (aunque sea falsy: "", 0, etc.)
    if (typeof property !== 'undefined') {
      return user[property];
    }

    return user;
  }
);
