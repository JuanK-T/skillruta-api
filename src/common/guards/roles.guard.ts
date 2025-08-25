import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
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
      return true; // no hay restricción de roles
    }

    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();

    // Si no hay usuario autenticado, denegar acceso
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.includes(request.user.role);
    if (!hasRole) {
      throw new ForbiddenException('No tiene permisos para este recurso');
    }

    return true;
  }
}
