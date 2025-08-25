// auth/application/auth.service.ts
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import {
  USER_REPOSITORY,
  UserRepositoryPort,
  AuthUserRecord,
} from '../../users/domain/user.repository.port';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../users/application/services/password-hasher.port';

import { RegisterUserUseCase } from '../../users/application/usecases/register-user.usecase';
import { SetRefreshTokenHashUseCase } from '../../users/application/usecases/set-refresh-token-hash.usecase';
import { IncrementTokenVersionUseCase } from '../../users/application/usecases/increment-token-version.usecase';
import { Role } from '../../../common/types';

type BaseUser = { id: string; email: string; role: Role; tv?: number };

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,

    // use cases ya exportados por UsersModule
    private readonly registerUser: RegisterUserUseCase,
    private readonly setRefreshHash: SetRefreshTokenHashUseCase,
    private readonly incTokenVersion: IncrementTokenVersionUseCase
  ) {}

  // ---------- Registro ----------
  async register(email: string, password: string, role: Role = Role.USER) {
    // delega toda la lógica de creación
    return this.registerUser.execute({ email, password, role });
  }

  // ---------- Validación ----------
  async validateUser(email: string, password: string): Promise<AuthUserRecord> {
    const u = await this.users.findAuthByEmail(email);
    if (!u?.passwordHash)
      throw new UnauthorizedException('Credenciales inválidas');

    const ok = await this.hasher.compare(password, u.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return u; // incluye tokenVersion
  }

  // ---------- Firmas ----------
  private signAccessToken(u: BaseUser) {
    return this.jwt.sign(
      { sub: u.id, email: u.email, role: u.role, tv: u.tv ?? 0 },
      {
        secret: this.cfg.get<string>('JWT_ACCESS_SECRET') ?? 'fallback-secret',
        expiresIn: this.cfg.get<string>('ACCESS_TOKEN_TTL') ?? '15m',
      }
    );
  }

  private signRefreshToken(u: BaseUser) {
    return this.jwt.sign(
      { sub: u.id, email: u.email, role: u.role, tv: u.tv ?? 0 },
      {
        secret: this.cfg.get<string>('JWT_REFRESH_SECRET') ?? 'fallback-secret',
        expiresIn: this.cfg.get<string>('REFRESH_TOKEN_TTL') ?? '7d',
      }
    );
  }

  // ---------- Emisión / rotación / revocación ----------
  async issueTokenPair(user: BaseUser) {
    const access = this.signAccessToken(user);
    const refresh = this.signRefreshToken(user);

    // guarda hash del refresh vía use case
    const refreshHash = await this.hasher.hash(refresh);
    await this.setRefreshHash.execute(user.id, refreshHash);

    return { access, refresh };
  }

  async rotateRefreshToken(user: BaseUser) {
    // Si quieres invalidación global en cada rotación:
    // await this.incTokenVersion.execute(user.id);
    return this.issueTokenPair(user);
  }

  async revokeRefreshTokens(userId: string) {
    await this.setRefreshHash.execute(userId, null);
  }
}
