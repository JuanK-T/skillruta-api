import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../types';
import { Request } from 'express';

// Interface local explícita
interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

/**
 * Decorador para obtener el usuario autenticado desde la request
 */
export const User = createParamDecorator(
  (
    property: keyof UserPayload | undefined,
    ctx: ExecutionContext
  ): UserPayload | string | number | Date | undefined => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new Error(
        'Usuario no encontrado en la request - ¿Está el AuthGuard aplicado?'
      );
    }

    if (property && request.user[property]) {
      return request.user[property];
    }

    return request.user;
  }
);
