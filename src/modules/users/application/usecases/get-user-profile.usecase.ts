import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/user.repository.port';
import { UserDto } from '../../domain/user.dto';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort
  ) {}

  async execute(id: string): Promise<UserDto> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
