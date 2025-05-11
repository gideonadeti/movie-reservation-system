import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(ReservationsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }
  async create(userId: string, createReservationDto: CreateReservationDto) {
    const { showtimeId, seatIds } = createReservationDto;

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const showtime = await tx.showtime.findUnique({
          where: { id: showtimeId },
          select: { auditoriumId: true },
        });

        if (!showtime) {
          throw new BadRequestException(
            `Showtime with ID ${showtimeId} not found`,
          );
        }

        const seats = await tx.seat.findMany({
          where: {
            id: { in: seatIds },
          },
        });

        if (seats.length !== seatIds.length) {
          const foundIds = new Set(seats.map((seat) => seat.id));
          const invalidIds = seatIds.filter((id) => !foundIds.has(id));

          throw new BadRequestException(
            `Invalid seat IDs: ${invalidIds.join(', ')}`,
          );
        }

        const invalidAuditoriumSeats = seats.filter(
          (seat) => seat.auditoriumId !== showtime.auditoriumId,
        );

        if (invalidAuditoriumSeats.length > 0) {
          const invalidIds = invalidAuditoriumSeats
            .map((seat) => seat.id)
            .join(', ');

          throw new BadRequestException(
            `Seats not in this auditorium: ${invalidIds}`,
          );
        }

        const reservedSeats = await tx.reservedSeat.findMany({
          where: {
            seatId: { in: seatIds },
            reservation: { showtimeId },
          },
          select: { seatId: true },
        });

        if (reservedSeats.length > 0) {
          const takenIds = reservedSeats.map((seat) => seat.seatId).join(', ');
          throw new BadRequestException(`Seats already reserved: ${takenIds}`);
        }

        return tx.reservation.create({
          data: {
            userId,
            showtimeId,
            reservedSeats: {
              create: seatIds.map((seatId) => ({
                seat: { connect: { id: seatId } },
              })),
            },
          },
        });
      });
    } catch (error) {
      this.handleError(error, 'create reservation');
    }
  }

  async findAll(userId: string) {
    try {
      return await this.prismaService.reservation.findMany({
        where: {
          userId,
        },
        include: {
          reservedSeats: true,
        },
      });
    } catch (error) {
      this.handleError(error, 'find all reservations');
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const reservation = await this.prismaService.reservation.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!reservation) {
        throw new BadRequestException(`Reservation with id ${id} not found`);
      }

      return reservation;
    } catch (error) {
      this.handleError(error, `fetch reservation with id ${id}`);
    }
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reservation`;
  }
}
