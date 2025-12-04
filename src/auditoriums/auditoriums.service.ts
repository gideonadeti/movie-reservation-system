import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { FindAllAuditoriumsDto } from './dto/find-all-auditoriums.dto';

@Injectable()
export class AuditoriumsService {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(AuditoriumsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    } else if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Auditorium name is already in use');
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  private getWhereConditions(query: FindAllAuditoriumsDto) {
    const { name, minCapacity, maxCapacity } = query;
    const whereConditions: Prisma.AuditoriumWhereInput = {};

    if (name) {
      whereConditions.name = { contains: name, mode: 'insensitive' };
    }

    if (minCapacity || maxCapacity) {
      whereConditions.capacity = {};

      if (minCapacity) whereConditions.capacity.gte = minCapacity;
      if (maxCapacity) whereConditions.capacity.lte = maxCapacity;
    }

    return whereConditions;
  }

  async create(createAuditoriumDto: CreateAuditoriumDto) {
    try {
      return await this.prismaService.auditorium.create({
        data: { ...createAuditoriumDto },
      });
    } catch (error) {
      this.handleError(error, 'create auditorium');
    }
  }

  async findAll(query: FindAllAuditoriumsDto) {
    const { sortBy, order, limit, page } = query;
    const whereConditions = this.getWhereConditions(query);

    try {
      if (!page && !limit) {
        return await this.prismaService.auditorium.findMany({
          where: whereConditions,
          orderBy: { [sortBy || 'createdAt']: order || 'desc' },
        });
      }

      const numberPage = page || 1;
      const numberLimit = limit || 10;
      const total = await this.prismaService.auditorium.count({
        where: whereConditions,
      });

      const lastPage = Math.ceil(total / numberLimit);
      const auditoriums = await this.prismaService.auditorium.findMany({
        where: whereConditions,
        orderBy: { [sortBy || 'createdAt']: order || 'desc' },
        skip: (numberPage - 1) * numberLimit,
        take: numberLimit,
      });

      return {
        auditoriums,
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
      this.handleError(error, 'fetch auditoriums');
    }
  }

  async findOne(id: string) {
    try {
      const auditorium = await this.prismaService.auditorium.findUnique({
        where: { id },
      });

      if (!auditorium) {
        throw new BadRequestException(`Auditorium with id ${id} not found`);
      }

      return auditorium;
    } catch (error) {
      this.handleError(error, `fetch auditorium with id ${id}`);
    }
  }

  async findReports(id: string) {
    try {
      const auditorium = await this.prismaService.auditorium.findUnique({
        where: { id },
        include: {
          seats: true,
          showtimes: true,
        },
      });

      if (!auditorium) {
        throw new BadRequestException(
          `Failed to fetch reports for auditorium with ID ${id}`,
        );
      }

      return {
        name: auditorium.name,
        capacity: auditorium.capacity,
        numberOfSeats: auditorium.seats.length,
        numberOfShowtimes: auditorium.showtimes.length,
      };
    } catch (error) {
      this.handleError(error, `fetch reports for auditorium with id ${id}`);
    }
  }

  async update(id: string, updateAuditoriumDto: UpdateAuditoriumDto) {
    try {
      return await this.prismaService.auditorium.update({
        where: {
          id,
        },
        data: updateAuditoriumDto,
      });
    } catch (error) {
      this.handleError(error, `update auditorium with id ${id}`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prismaService.auditorium.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this.handleError(error, `delete auditorium with id ${id}`);
    }
  }
}
