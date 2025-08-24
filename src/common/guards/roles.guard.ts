import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, UserPayload } from '../types';
import { Request } from 'express';

// Interface local explícita
interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

/**
 * Guard para verificar roles de usuario
 *
 * Este guard verifica si el usuario autenticado tiene los roles requeridos
 * para acceder a un endpoint específico.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(Role.ADMIN)
 * @Get('admin-only')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Obtener roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();

    // Si no hay usuario autenticado, denegar acceso
    if (!request.user) {
      return false;
    }

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    return requiredRoles.includes(request.user.role);
  }
}
