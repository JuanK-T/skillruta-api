import { SetMetadata } from '@nestjs/common';
import { Role } from '../types';

// Clave para almacenar metadatos de roles en los controladores
export const ROLES_KEY = 'roles';

// Decorador para restringir acceso a endpoints por roles
// Ejemplo: @Roles(Role.ADMIN) → Solo administradores pueden acceder
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
