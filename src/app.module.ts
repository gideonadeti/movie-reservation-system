import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { LoggingMiddleware } from './logging/logging.middleware';
import { MoviesModule } from './movies/movies.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AuditoriumsModule } from './auditoriums/auditoriums.module';
import { SeatsModule } from './seats/seats.module';

@Module({
  imports: [AuthModule, MoviesModule, ShowtimesModule, ReservationsModule, AuditoriumsModule, SeatsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
