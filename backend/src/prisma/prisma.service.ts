import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected successfully');
        return;
      } catch (err) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxRetries} failed. Retrying in 3s...`,
        );
        if (attempt === maxRetries) throw err;
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
  }
}