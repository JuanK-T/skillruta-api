import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService], // ? Proveer el servicio de base de datos
  exports: [PrismaService], // ? Exportar el servicio para uso global
})
export class PrismaModule {}
