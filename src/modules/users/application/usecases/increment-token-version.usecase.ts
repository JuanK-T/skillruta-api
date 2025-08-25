import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/user.repository.port';

@Injectable()
export class IncrementTokenVersionUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort
  ) {}

  execute(userId: string): Promise<void> {
    return this.users.incrementTokenVersion(userId);
  }
}
