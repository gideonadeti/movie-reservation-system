import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class SeatsService {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(SeatsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    } else if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Seat already exists');
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }
  async create(userId: string, createSeatDto: CreateSeatDto) {
    const { auditoriumId } = createSeatDto;

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const auditorium = await tx.auditorium.findUnique({
          where: { id: auditoriumId },
        });

        if (!auditorium) {
          throw new BadRequestException(
            `Auditorium with id ${auditoriumId} not found`,
          );
        }

        const seatCount = await tx.seat.count({
          where: { auditoriumId },
        });

        if (seatCount + 1 > auditorium.capacity) {
          throw new BadRequestException(
            `Auditorium with id ${auditoriumId} is full`,
          );
        }

        return tx.seat.create({
          data: { ...createSeatDto, adminId: userId },
        });
      });
    } catch (error) {
      this.handleError(error, 'create seat');
    }
  }

  async findAll() {
    try {
      return await this.prismaService.seat.findMany();
    } catch (error) {
      this.handleError(error, 'fetch seats');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prismaService.seat.findUnique({ where: { id } });
    } catch (error) {
      this.handleError(error, `fetch seat with id ${id}`);
    }
  }

  async update(userId: string, id: string, updateSeatDto: UpdateSeatDto) {
    try {
      return await this.prismaService.seat.update({
        where: {
          id,
          adminId: userId,
        },
        data: updateSeatDto,
      });
    } catch (error) {
      this.handleError(error, `update seat with id ${id}`);
    }
  }

  async remove(userId: string, id: string) {
    try {
      return await this.prismaService.seat.delete({
        where: {
          id,
          adminId: userId,
        },
      });
    } catch (error) {
      this.handleError(error, `delete seat with id ${id}`);
    }
  }
}
