import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../../../common/types';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/user.repository.port';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../services/password-hasher.port';
import { UserDto } from '../../domain/user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort
  ) {}

  async execute(input: {
    email: string;
    password: string;
    role?: Role;
  }): Promise<UserDto> {
    const exists = await this.users.findByEmail(input.email);
    if (exists) throw new Error('Email ya registrado');

    const passwordHash = await this.hasher.hash(input.password);
    const name = input.email.split('@')[0]; // regla actual: name antes del @
    const role = input.role ?? Role.USER;

    return this.users.create(input.email, passwordHash, role, name);
  }
}
