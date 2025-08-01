import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'generated/prisma';
import { UserId } from 'src/user-id/user-id.decorator';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Seats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post()
  create(@UserId() userId: string, @Body() createSeatDto: CreateSeatDto) {
    return this.seatsService.create(userId, createSeatDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.seatsService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.seatsService.findOne(id);
  }

  @Get(':id/reports')
  findReports(@UserId() userId: string, @Param('id') id: string) {
    return this.seatsService.findReports(userId, id);
  }

  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateSeatDto: UpdateSeatDto,
  ) {
    return this.seatsService.update(userId, id, updateSeatDto);
  }

  @Delete(':id')
  remove(@UserId() userId: string, @Param('id') id: string) {
    return this.seatsService.remove(userId, id);
  }
}
