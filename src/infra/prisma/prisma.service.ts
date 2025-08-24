import {
  INestApplication,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.debug('✅ Database connection established');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.debug('🔌 Database connection closed');
  }

  enableShutdownHooks(app: INestApplication) {
    this.setupProcessListeners(app);
  }

  private setupProcessListeners(app: INestApplication) {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📋 Received ${signal}, starting graceful shutdown...`);

      try {
        await app.close();
        console.log('✅ NestJS application closed');

        await this.$disconnect();
        console.log('✅ Database connection closed');

        console.log('🎯 Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Manejar señales con IIFE para evitar errores de ESLint
    process.on('SIGINT', () => {
      void gracefulShutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      void gracefulShutdown('SIGTERM');
    });

    // Manejar excepciones no capturadas
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      void gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      void gracefulShutdown('unhandledRejection');
    });
  }
}
