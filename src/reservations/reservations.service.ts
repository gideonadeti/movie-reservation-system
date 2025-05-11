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
    try {
      return await this.prismaService.reservation.create({
        data: {
          userId,
          showtimeId: createReservationDto.showtimeId,
          reservedSeats: {
            create: createReservationDto.seatIds.map((seatId) => ({
              seat: {
                connect: { id: seatId },
              },
            })),
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'create reservation');
    }
  }

  findAll() {
    return `This action returns all reservations`;
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
