import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }

  async softDelete(model: string, id: string): Promise<void> {
    const deletedAt = new Date();
    await (this as any)[model].update({
      where: { id },
      data: { deletedAt },
    });
  }

  async softDeleteMany(model: string, where: any): Promise<void> {
    const deletedAt = new Date();
    await (this as any)[model].updateMany({
      where,
      data: { deletedAt },
    });
  }
}
