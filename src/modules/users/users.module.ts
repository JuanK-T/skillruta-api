import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { USER_REPOSITORY } from './domain/user.repository.port';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { BcryptProvider } from './infrastructure/bcrypt.service';

// Use cases
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { FindUserByEmailUseCase } from './application/usecases/find-user-by-email.usecase';
import { GetUserProfileUseCase } from './application/usecases/get-user-profile.usecase';
import { SetRefreshTokenHashUseCase } from './application/usecases/set-refresh-token-hash.usecase';
import { IncrementTokenVersionUseCase } from './application/usecases/increment-token-version.usecase';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    BcryptProvider,
    RegisterUserUseCase,
    FindUserByEmailUseCase,
    GetUserProfileUseCase,
    SetRefreshTokenHashUseCase,
    IncrementTokenVersionUseCase,
  ],
  exports: [
    USER_REPOSITORY,
    BcryptProvider,
    RegisterUserUseCase,
    FindUserByEmailUseCase,
    GetUserProfileUseCase,
    SetRefreshTokenHashUseCase,
    IncrementTokenVersionUseCase,
  ],
})
export class UsersModule {}
