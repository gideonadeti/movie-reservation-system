import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MoviesService {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(MoviesService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    } else if (error instanceof ForbiddenException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
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

  async findAll() {
    try {
      return await this.prismaService.movie.findMany();
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

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
