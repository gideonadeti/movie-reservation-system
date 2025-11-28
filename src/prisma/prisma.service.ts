import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
