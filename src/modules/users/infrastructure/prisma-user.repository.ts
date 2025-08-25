import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { Role } from '../../../common/types';
import {
  AuthUserRecord,
  UserRepositoryPort,
} from '../domain/user.repository.port';
import { UserDto } from '../domain/user.dto';
import { User } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserDto | null> {
    const u = await this.prisma.user.findUnique({ where: { email } });
    return u ? this.map(u) : null;
  }

  async findById(id: string): Promise<UserDto | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    return u ? this.map(u) : null;
  }

  async create(
    email: string,
    passwordHash: string,
    role: Role = Role.USER,
    name?: string
  ): Promise<UserDto> {
    const data = {
      email,
      passwordHash,
      role: role as User['role'],
      name: name ?? email.split('@')[0],
    };
    const u = await this.prisma.user.create({ data });
    return this.map(u);
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

  private map(u: User): UserDto {
    return {
      id: u.id,
      email: u.email,
      role: u.role as Role,
      name: u.name ?? '',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }

  async findAuthByEmail(email: string): Promise<AuthUserRecord | null> {
    const u = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        tokenVersion: true,
      },
    });
    return u
      ? {
          id: u.id,
          email: u.email,
          role: u.role as Role,
          passwordHash: u.passwordHash,
          tokenVersion: u.tokenVersion,
        }
      : null;
  }
}
