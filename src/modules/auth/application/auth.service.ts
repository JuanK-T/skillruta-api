import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../../users/user.repository.port';
import { Role } from '../../../common/types';

type BaseUser = { id: string; email: string; role: Role };

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService
  ) {}

  // ---------- Registro y validación ----------
  async register(email: string, password: string, role: Role = Role.USER) {
    const hash = await bcrypt.hash(password, 10);
    return this.users.create(email, hash, role);
  }

  async validateUser(email: string, password: string) {
    const u = await this.users.findByEmail(email);
    if (!u?.passwordHash)
      throw new UnauthorizedException('Credenciales inválidas');
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    return u; // incluye id, email, role, passwordHash
  }

  // ---------- Firmas ----------
  private signAccessToken(u: BaseUser & { tv?: number }) {
    return this.jwt.sign(
      { sub: u.id, email: u.email, role: u.role, tv: u.tv ?? 0 },
      {
        secret: this.cfg.get<string>('JWT_ACCESS_SECRET') ?? 'fallback-secret',
        expiresIn: this.cfg.get<string>('ACCESS_TOKEN_TTL') ?? '15m',
      }
    );
  }

  private signRefreshToken(u: BaseUser & { tv?: number }) {
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

    // Guarda hash del refresh para validación posterior
    const refreshHash = await bcrypt.hash(refresh, 10);
    await this.users.setRefreshTokenHash(user.id, refreshHash);

    return { access, refresh };
  }

  async rotateRefreshToken(user: BaseUser) {
    // Si quieres invalidación global, descomenta:
    // await this.users.incrementTokenVersion(user.id);
    return this.issueTokenPair(user);
  }

  async revokeRefreshTokens(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
  }
}
