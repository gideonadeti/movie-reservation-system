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

  update(id: number, updateSeatDto: UpdateSeatDto) {
    return `This action updates a #${id} seat`;
  }

  remove(id: number) {
    return `This action removes a #${id} seat`;
  }
}
