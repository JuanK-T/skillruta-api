import { Role } from '../../../common/types';
import { UserDto } from './user.dto';

export interface AuthUserRecord {
  id: string;
  email: string;
  role: Role;
  passwordHash: string;
  tokenVersion: number;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserDto | null>;
  findById(id: string): Promise<UserDto | null>;
  create(
    email: string,
    passwordHash: string,
    role?: Role,
    name?: string
  ): Promise<UserDto>;
  setRefreshTokenHash(userId: string, hash: string | null): Promise<void>;
  incrementTokenVersion(userId: string): Promise<void>;
  findAuthByEmail(email: string): Promise<AuthUserRecord | null>;
}
