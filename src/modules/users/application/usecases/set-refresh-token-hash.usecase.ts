import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/user.repository.port';

@Injectable()
export class SetRefreshTokenHashUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort
  ) {}

  execute(userId: string, hash: string | null): Promise<void> {
    return this.users.setRefreshTokenHash(userId, hash);
  }
}
