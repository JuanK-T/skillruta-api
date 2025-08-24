import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { UserDto, UserRepositoryPort } from './user.repository.port';
import { Role } from '../../common/types';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private prisma: PrismaService) {}

  // Busca usuario por email - para login
  async findByEmail(email: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user
      ? {
          id: user.id,
          email: user.email,
          role: user.role as Role, // Conversión de tipo seguro
          passwordHash: user.passwordHash, // Incluye hash para auth
        }
      : null;
  }

  // Crea nuevo usuario - para registro
  async create(
    email: string,
    passwordHash: string,
    role: Role = Role.USER // Rol por defecto: USER
  ): Promise<UserDto> {
    const user = await this.prisma.user.create({
      data: { email, passwordHash, role },
    });
    return {
      id: user.id,
      email: user.email,
      role: user.role as Role, // Conversión de tipo
    };
  }

  // Busca usuario por ID - para obtener perfil
  async findById(id: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user
      ? {
          id: user.id,
          email: user.email,
          role: user.role as Role, // Conversión de tipo
        }
      : null;
  }

  async setRefreshTokenHash(
    userId: string,
    hash: string | null
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  async incrementTokenVersion(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}
