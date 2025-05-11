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

  findOne(id: number) {
    return `This action returns a #${id} reservation`;
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reservation`;
  }
}
