import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/user.repository.port';
import { UserDto } from '../../domain/user.dto';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort
  ) {}

  execute(email: string): Promise<UserDto | null> {
    return this.users.findByEmail(email);
  }
}
