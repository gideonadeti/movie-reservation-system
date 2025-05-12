import { Module } from '@nestjs/common';
import { AuditoriumsService } from './auditoriums.service';
import { AuditoriumsController } from './auditoriums.controller';

@Module({
  controllers: [AuditoriumsController],
  providers: [AuditoriumsService],
})
export class AuditoriumsModule {}
