import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';

import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'generated/prisma';
import { UserId } from 'src/user-id/user-id.decorator';
import { FindAllShowtimesDto } from './dto/find-all-showtimes.dto';

@ApiTags('Showtimes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(
    @UserId() userId: string,
    @Body() createShowtimeDto: CreateShowtimeDto,
  ) {
    return this.showtimesService.create(userId, createShowtimeDto);
  }

  @Get()
  findAll(@Query() query: FindAllShowtimesDto) {
    return this.showtimesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showtimesService.findOne(id);
  }

  @Get(':id/reports')
  findReports(@Param('id') id: string) {
    return this.showtimesService.findReports(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateShowtimeDto: UpdateShowtimeDto,
  ) {
    return this.showtimesService.update(userId, id, updateShowtimeDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@UserId() userId: string, @Param('id') id: string) {
    return this.showtimesService.remove(userId, id);
  }
}
