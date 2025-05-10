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
    try {
      return await this.prismaService.showtime.create({
        data: { ...createShowtimeDto, adminId: userId },
      });
    } catch (error) {
      this.handleError(error, 'create showtime');
    }
  }

  findAll() {
    return `This action returns all showtimes`;
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
