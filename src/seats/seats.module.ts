import { Module } from '@nestjs/common';

import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SeatsController],
  providers: [SeatsService, PrismaService],
})
export class SeatsModule {}
