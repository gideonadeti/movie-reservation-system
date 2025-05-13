import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditoriumsService {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(AuditoriumsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async create(userId: string, createAuditoriumDto: CreateAuditoriumDto) {
    try {
      return await this.prismaService.auditorium.create({
        data: { ...createAuditoriumDto, adminId: userId },
      });
    } catch (error) {
      this.handleError(error, 'create auditorium');
    }
  }

  async findAll() {
    try {
      return await this.prismaService.auditorium.findMany();
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

  async findReports(userId: string, id: string) {
    try {
      const auditorium = await this.prismaService.auditorium.findUnique({
        where: { id, adminId: userId },
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

  async update(
    userId: string,
    id: string,
    updateAuditoriumDto: UpdateAuditoriumDto,
  ) {
    try {
      return await this.prismaService.auditorium.update({
        where: {
          id,
          adminId: userId,
        },
        data: updateAuditoriumDto,
      });
    } catch (error) {
      this.handleError(error, `update auditorium with id ${id}`);
    }
  }

  async remove(userId: string, id: string) {
    try {
      return await this.prismaService.auditorium.delete({
        where: {
          id,
          adminId: userId,
        },
      });
    } catch (error) {
      this.handleError(error, `delete auditorium with id ${id}`);
    }
  }
}
