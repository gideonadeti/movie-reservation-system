import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ReservationStatus, Seat } from '@prisma/client';

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

  private async validateShowtimeExists(
    tx: Prisma.TransactionClient,
    showtimeId: string,
  ) {
    const showtime = await tx.showtime.findUnique({
      where: { id: showtimeId },
      select: {
        auditoriumId: true,
        auditorium: true,
        startTime: true,
        price: true,
      },
    });

    if (!showtime) {
      throw new BadRequestException(`Showtime with ID ${showtimeId} not found`);
    }

    if (showtime.startTime < new Date()) {
      throw new BadRequestException(
        'Cannot reserve seats for a showtime that has already started',
      );
    }

    return showtime;
  }

  private async validateSeatIds(
    tx: Prisma.TransactionClient,
    seatIds: string[],
  ) {
    const seats = await tx.seat.findMany({
      where: { id: { in: seatIds } },
    });

    if (seats.length !== seatIds.length) {
      const foundIds = new Set(seats.map((s) => s.id));
      const invalidIds = seatIds.filter((id) => !foundIds.has(id));

      throw new BadRequestException(
        `Invalid seat IDs: ${invalidIds.join(', ')}`,
      );
    }

    return seats;
  }

  private ensureSeatsInAuditorium(seats: Seat[], auditoriumId: string) {
    const invalidSeats = seats.filter((s) => s.auditoriumId !== auditoriumId);

    if (invalidSeats.length > 0) {
      const invalidIds = invalidSeats.map((s) => s.id).join(', ');

      throw new BadRequestException(
        `Seats not in this auditorium: ${invalidIds}`,
      );
    }
  }

  private async ensureSeatsNotReserved(
    tx: Prisma.TransactionClient,
    seatIds: string[],
    showtimeId: string,
  ) {
    const reservedSeats = await tx.reservedSeat.findMany({
      where: {
        seatId: { in: seatIds },
        reservation: { showtimeId },
      },
      select: { seatId: true },
    });

    if (reservedSeats.length > 0) {
      const reservedSeatIds = reservedSeats.map((r) => r.seatId).join(', ');

      throw new BadRequestException(
        `Seats already reserved: ${reservedSeatIds}`,
      );
    }
  }

  private async ensureAuditoriumCapacityIsNotExceeded(
    tx: Prisma.TransactionClient,
    showtimeId: string,
    seatIds: string[],
    showtime: { auditorium: { capacity: number } },
  ) {
    const currentReservedCount = await tx.reservedSeat.count({
      where: {
        reservation: { showtimeId },
      },
    });

    if (currentReservedCount + seatIds.length > showtime.auditorium.capacity) {
      const numOfSeatsLeft =
        showtime.auditorium.capacity - currentReservedCount;
      let errorMessage = 'Reservation exceeds auditorium capacity.';

      if (numOfSeatsLeft === 0) {
        errorMessage += ` No seats left.`;
      } else if (numOfSeatsLeft === 1) {
        errorMessage += ` Only ${numOfSeatsLeft} seat left.`;
      } else {
        errorMessage += ` Only ${numOfSeatsLeft} seats left.`;
      }

      throw new BadRequestException(errorMessage);
    }
  }

  private validatePaymentAmount(
    amountPaid: number,
    amountCharged: number,
    numberOfSeats: number,
    pricePerSeat: number,
  ) {
    if (amountCharged !== numberOfSeats * pricePerSeat) {
      // This should never happen if we compute amountCharged correctly;
      // guard against accidental mismatches.
      throw new InternalServerErrorException(
        'Invalid charged amount calculated for reservation',
      );
    }

    if (amountPaid < amountCharged) {
      throw new BadRequestException(
        `Insufficient payment. Expected at least $${amountCharged.toFixed(
          2,
        )} for ${numberOfSeats} seat(s) at $${pricePerSeat.toFixed(
          2,
        )} each, but received $${amountPaid.toFixed(2)}`,
      );
    }
  }

  async create(userId: string, createReservationDto: CreateReservationDto) {
    const { showtimeId, seatIds, amountPaid } = createReservationDto;

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const showtime = await this.validateShowtimeExists(tx, showtimeId);
        const seats = await this.validateSeatIds(tx, seatIds);
        const amountCharged = seatIds.length * showtime.price;

        this.validatePaymentAmount(
          amountPaid,
          amountCharged,
          seatIds.length,
          showtime.price,
        );
        this.ensureSeatsInAuditorium(seats, showtime.auditoriumId);
        await this.ensureSeatsNotReserved(tx, seatIds, showtimeId);
        await this.ensureAuditoriumCapacityIsNotExceeded(
          tx,
          showtimeId,
          seatIds,
          showtime,
        );

        const reservation = await tx.reservation.create({
          data: {
            userId,
            showtimeId,
            amountCharged,
            amountPaid,
            reservedSeats: {
              create: seatIds.map((seatId) => ({
                seat: { connect: { id: seatId } },
              })),
            },
          },
        });

        // Calculate balance
        const balance = amountPaid - amountCharged;

        // Return reservation with payment details
        return {
          ...reservation,
          payment: {
            amountCharged: parseFloat(amountCharged.toFixed(2)),
            amountPaid: parseFloat(amountPaid.toFixed(2)),
            balance: balance > 0 ? parseFloat(balance.toFixed(2)) : 0,
          },
        };
      });
    } catch (error) {
      this.handleError(error, 'create reservation');
    }
  }

  async cancel(userId: string, id: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const reservation = await tx.reservation.findUnique({
          where: { id, userId },
        });

        if (!reservation) {
          throw new BadRequestException(`Reservation with id ${id} not found`);
        }

        if (reservation.status === ReservationStatus.CANCELLED) {
          throw new BadRequestException(
            `Reservation with id ${id} already cancelled`,
          );
        }

        await tx.reservedSeat.deleteMany({
          where: { reservationId: id },
        });

        return await tx.reservation.update({
          where: { id, userId },
          data: { status: ReservationStatus.CANCELLED },
        });
      });
    } catch (error) {
      this.handleError(error, `cancel reservation with id ${id}`);
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

  async update(
    userId: string,
    id: string,
    updateReservationDto: UpdateReservationDto,
  ) {
    // eslint-disable-next-line prefer-const
    let { showtimeId, seatIds, status } = updateReservationDto;

    try {
      return await this.prismaService.$transaction(
        async (tx) => {
          const reservation = await tx.reservation.findUnique({
            where: { id, userId },
            include: { reservedSeats: true },
          });

          if (!reservation) {
            throw new Error();
          }

          showtimeId = showtimeId || reservation.showtimeId;
          seatIds = seatIds || reservation.reservedSeats.map((r) => r.seatId);

          const showtime = await this.validateShowtimeExists(tx, showtimeId);
          const seats = await this.validateSeatIds(tx, seatIds);

          if (status && status === 'CANCELLED') {
            if (showtime.startTime < new Date()) {
              throw new BadRequestException(
                'Cannot cancel a reservation that has already started',
              );
            }
          }

          this.ensureSeatsInAuditorium(seats, showtime.auditoriumId);
          await this.ensureSeatsNotReserved(tx, seatIds, showtimeId);
          await this.ensureAuditoriumCapacityIsNotExceeded(
            tx,
            showtimeId,
            seatIds,
            showtime,
          );

          await tx.reservedSeat.deleteMany({
            where: { reservationId: reservation.id },
          });

          return tx.reservation.update({
            where: {
              id,
              userId,
            },
            data: {
              userId,
              showtimeId,
              reservedSeats: {
                create: (
                  seatIds || reservation.reservedSeats.map((r) => r.seatId)
                ).map((seatId) => ({
                  seat: { connect: { id: seatId } },
                })),
              },
            },
          });
        },
        { timeout: 10000 }, // 10 seconds
      );
    } catch (error) {
      this.handleError(error, `update reservation with  id ${id}`);
    }
  }

  async remove(userId: string, id: string) {
    try {
      return await this.prismaService.reservation.delete({
        where: {
          id,
          userId,
        },
      });
    } catch (error) {
      this.handleError(error, `delete reservation with id ${id}`);
    }
  }
}
