import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';
import { FindAllMoviesDto } from './dto/find-all-movies.dto';

@Injectable()
export class MoviesService {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(MoviesService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    } else if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Title is already in use');
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  private getWhereConditions(query: FindAllMoviesDto) {
    const { title, description, genre } = query;
    const whereConditions: Prisma.MovieWhereInput = {};

    if (title) {
      whereConditions.title = { contains: title, mode: 'insensitive' };
    }

    if (description) {
      whereConditions.description = {
        contains: description,
        mode: 'insensitive',
      };
    }

    if (genre) {
      whereConditions.genre = { contains: genre, mode: 'insensitive' };
    }

    return whereConditions;
  }

  async create(userId: string, createMovieDto: CreateMovieDto) {
    try {
      return await this.prismaService.movie.create({
        data: { ...createMovieDto, adminId: userId },
      });
    } catch (error) {
      this.handleError(error, 'create movie');
    }
  }

  async findAll(query: FindAllMoviesDto) {
    const { sortBy, order, limit, page } = query;
    const whereConditions = this.getWhereConditions(query);

    try {
      if (!page && !limit) {
        return await this.prismaService.movie.findMany({
          where: whereConditions,
          orderBy: { [sortBy as string]: order },
        });
      }

      const numberPage = page ? Number(page) : 1;
      const numberLimit = limit ? Number(limit) : 10;
      const total = await this.prismaService.movie.count({
        where: whereConditions,
      });
      const lastPage = Math.ceil(total / numberLimit);
      const movies = await this.prismaService.movie.findMany({
        where: whereConditions,
        orderBy: { [sortBy as string]: order },
        skip: (numberPage - 1) * numberLimit,
        take: numberLimit,
      });

      return {
        movies,
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
      this.handleError(error, 'fetch movies');
    }
  }

  async findOne(id: string) {
    try {
      const movie = await this.prismaService.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        throw new BadRequestException(`Movie with id ${id} not found`);
      }

      return movie;
    } catch (error) {
      this.handleError(error, `fetch movie with id ${id}`);
    }
  }

  async findReports(userId: string, id: string) {
    try {
      const movie = await this.prismaService.movie.findUnique({
        where: { id, adminId: userId },
        include: {
          showtimes: true,
        },
      });

      if (!movie) {
        throw new BadRequestException(
          `Failed to fetch reports for movie with ID ${id}`,
        );
      }

      return {
        numberOfShowtimes: movie.showtimes.length,
      };
    } catch (error) {
      this.handleError(error, `fetch movie with id ${id}`);
    }
  }

  async update(userId: string, id: string, updateMovieDto: UpdateMovieDto) {
    try {
      return await this.prismaService.movie.update({
        where: {
          id,
          adminId: userId,
        },
        data: updateMovieDto,
      });
    } catch (error) {
      this.handleError(error, `update movie with id ${id}`);
    }
  }

  async remove(userId: string, id: string) {
    try {
      return await this.prismaService.movie.delete({
        where: {
          id,
          adminId: userId,
        },
      });
    } catch (error) {
      this.handleError(error, `delete movie with id ${id}`);
    }
  }
}
