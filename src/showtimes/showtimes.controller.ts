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
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { UserRole } from '@prisma/client';
import { FindAllShowtimesDto } from './dto/find-all-showtimes.dto';
import { Public } from 'src/auth/public.decorator';
import { SeedShowtimesDto } from './dto/seed-showtimes.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Post()
  create(@Body() createShowtimeDto: CreateShowtimeDto) {
    return this.showtimesService.create(createShowtimeDto);
  }

  @Post('seed')
  seed(@Body() dto: SeedShowtimesDto) {
    return this.showtimesService.seed(dto.count);
  }

  @Get()
  @Public()
  findAll(@Query() query: FindAllShowtimesDto) {
    return this.showtimesService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.showtimesService.findOne(id);
  }

  @Get(':id/reports')
  findReports(@Param('id') id: string) {
    return this.showtimesService.findReports(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShowtimeDto: UpdateShowtimeDto,
  ) {
    return this.showtimesService.update(id, updateShowtimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.showtimesService.remove(id);
  }
}
