/**
 * Roles disponibles en el sistema
 *
 * @enum Role
 * @property ADMIN - Usuario administrador con todos los permisos
 * @property USER - Usuario regular con permisos básicos
 */
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

/**
 * Información del usuario autenticado que se incluye en el JWT
 *
 * @interface UserPayload
 * @property id - Identificador único del usuario
 * @property email - Correo electrónico del usuario
 * @property role - Rol del usuario (ADMIN o USER)
 * @property createdAt - Fecha de creación (opcional)
 * @property updatedAt - Fecha de última actualización (opcional)
 */
export interface UserPayload {
  id: string;
  email: string;
  role: Role;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
