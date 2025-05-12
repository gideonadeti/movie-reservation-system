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

  findAll() {
    return `This action returns all auditoriums`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditorium`;
  }

  update(id: number, updateAuditoriumDto: UpdateAuditoriumDto) {
    return `This action updates a #${id} auditorium`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditorium`;
  }
}
