import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllShowtimesDto } from './dto/find-all-showtimes.dto';
import { Prisma } from 'generated/prisma';

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

  private getWhereConditions(query: FindAllShowtimesDto) {
    const {
      adminId,
      auditoriumId,
      endTimeFrom,
      endTimeTo,
      maxPrice,
      minPrice,
      movieId,
      startTimeFrom,
      startTimeTo,
    } = query;
    const whereConditions: Prisma.ShowtimeWhereInput = {};

    if (adminId) {
      whereConditions.adminId = adminId;
    }

    if (auditoriumId) {
      whereConditions.auditoriumId = auditoriumId;
    }

    if (movieId) {
      whereConditions.movieId = movieId;
    }

    if (startTimeFrom || startTimeTo) {
      whereConditions.startTime = {};

      if (startTimeFrom) whereConditions.startTime.gte = startTimeFrom;
      if (startTimeTo) whereConditions.startTime.lte = startTimeTo;
    }

    if (endTimeFrom || endTimeTo) {
      whereConditions.endTime = {};

      if (endTimeFrom) whereConditions.endTime.gte = endTimeFrom;
      if (endTimeTo) whereConditions.endTime.lte = endTimeTo;
    }

    if (minPrice || maxPrice) {
      whereConditions.price = {};

      if (minPrice) whereConditions.price.gte = minPrice;
      if (maxPrice) whereConditions.price.lte = maxPrice;
    }

    return whereConditions;
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

  async findAll(query: FindAllShowtimesDto) {
    const { sortBy, order, limit, page } = query;
    const whereConditions = this.getWhereConditions(query);

    try {
      if (!page && !limit) {
        return await this.prismaService.showtime.findMany({
          where: whereConditions,
          orderBy: { [sortBy || 'createdAt']: order || 'desc' },
        });
      }

      const numberPage = page || 1;
      const numberLimit = limit || 10;
      const total = await this.prismaService.showtime.count({
        where: whereConditions,
      });
      const lastPage = Math.ceil(total / numberLimit);
      const showtimes = await this.prismaService.showtime.findMany({
        where: whereConditions,
        orderBy: { [sortBy || 'createdAt']: order || 'desc' },
        skip: (numberPage - 1) * numberLimit,
        take: numberLimit,
      });

      return {
        showtimes,
        metadata: {
          total,
          lastPage,
          page: numberPage,
          limit: numberLimit,
          hasNextPage: numberPage < lastPage,
          hasPreviousPage: numberPage > 1,
        },
      };
    } catch (error) {
      this.handleError(error, 'fetch all showtimes');
    }
  }

  async findOne(id: string) {
    try {
      const showtime = await this.prismaService.showtime.findUnique({
        where: { id },
        include: {
          movie: true,
          auditorium: true,
        },
      });

      if (!showtime) {
        throw new BadRequestException(`Showtime with id ${id} not found`);
      }

      return showtime;
    } catch (error) {
      this.handleError(error, `fetch showtime with id ${id}`);
    }
  }

  update(id: number, updateShowtimeDto: UpdateShowtimeDto) {
    return `This action updates a #${id} showtime`;
  }

  remove(id: number) {
    return `This action removes a #${id} showtime`;
  }
}
