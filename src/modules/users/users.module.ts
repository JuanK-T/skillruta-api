import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { PrismaUserRepository } from './prisma-user.repository';
import { USER_REPOSITORY } from './user.tokens';

@Module({
  imports: [PrismaModule],
  providers: [{ provide: USER_REPOSITORY, useClass: PrismaUserRepository }],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
