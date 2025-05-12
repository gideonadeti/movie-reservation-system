import { Module } from '@nestjs/common';

import { AuditoriumsService } from './auditoriums.service';
import { AuditoriumsController } from './auditoriums.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AuditoriumsController],
  providers: [AuditoriumsService, PrismaService],
})
export class AuditoriumsModule {}
