import { Role } from '../../common/types';

// DTO para transferencia de datos de usuario
// Contiene información esencial del usuario sin datos sensibles
export interface UserDto {
  id: string; // Identificador único del usuario
  email: string; // Correo electrónico (único)
  role: Role; // Rol del usuario (ADMIN/USER)
  passwordHash?: string; // Hash de contraseña (opcional por seguridad)
}

// Puerto del repositorio de usuarios - Define el contrato
// para las operaciones de base de datos de usuarios
export interface UserRepositoryPort {
  // Buscar usuario por email (para login)
  findByEmail(email: string): Promise<UserDto | null>;

  // Crear nuevo usuario (para registro)
  create(email: string, passwordHash: string, role?: Role): Promise<UserDto>;

  // Buscar usuario por ID (para obtener perfil)
  findById(id: string): Promise<UserDto | null>;
}
