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

import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'generated/prisma';
import { UserId } from 'src/user-id/user-id.decorator';
import { FindAllMoviesDto } from './dto/find-all-movies.dto';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Movies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  create(@UserId() userId: string, @Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(userId, createMovieDto);
  }

  @Get()
  @Public()
  findAll(@Query() query: FindAllMoviesDto) {
    return this.moviesService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Get(':id/reports')
  findReports(@UserId() userId: string, @Param('id') id: string) {
    return this.moviesService.findReports(userId, id);
  }

  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.update(userId, id, updateMovieDto);
  }

  @Delete(':id')
  remove(@UserId() userId: string, @Param('id') id: string) {
    return this.moviesService.remove(userId, id);
  }
}
