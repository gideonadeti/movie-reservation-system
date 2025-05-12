import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeatsService {
  constructor(private prismaService: PrismaService) {}

  private logger = new Logger(SeatsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }
  async create(userId: string, createSeatDto: CreateSeatDto) {
    try {
      return await this.prismaService.seat.create({
        data: { ...createSeatDto, adminId: userId },
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

  remove(id: number) {
    return `This action removes a #${id} seat`;
  }
}
