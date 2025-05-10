import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShowtimesService {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(ShowtimesService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }
  async create(userId: string, createShowtimeDto: CreateShowtimeDto) {
    const { startTime, endTime, auditoriumId } = createShowtimeDto;

    if (startTime > endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Start time must be in the future');
    }

    try {
      const overlap = await this.prismaService.showtime.findFirst({
        where: {
          auditoriumId: auditoriumId,
          startTime: {
            lt: endTime,
          },
          endTime: {
            gt: startTime,
          },
        },
      });

      if (overlap) {
        throw new BadRequestException(
          'The auditorium is unavailable during this period',
        );
      }

      return await this.prismaService.showtime.create({
        data: { ...createShowtimeDto, adminId: userId },
      });
    } catch (error) {
      this.handleError(error, 'create showtime');
    }
  }

  async findAll() {
    try {
      return await this.prismaService.showtime.findMany();
    } catch (error) {
      this.handleError(error, 'fetch all showtimes');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} showtime`;
  }

  update(id: number, updateShowtimeDto: UpdateShowtimeDto) {
    return `This action updates a #${id} showtime`;
  }

  remove(id: number) {
    return `This action removes a #${id} showtime`;
  }
}
