import { Module } from '@nestjs/common';

import { ShowtimesService } from './showtimes.service';
import { ShowtimesController } from './showtimes.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ShowtimesController],
  providers: [ShowtimesService, PrismaService],
})
export class ShowtimesModule {}
