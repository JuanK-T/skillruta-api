import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './prisma-user.repository';

@Module({
  providers: [
    {
      provide: 'UserRepositoryPort', // Token de inyección
      useClass: PrismaUserRepository, // Implementación concreta
    },
  ],
  exports: ['UserRepositoryPort'], // Exporta para otros módulos
})
export class UsersModule {}
