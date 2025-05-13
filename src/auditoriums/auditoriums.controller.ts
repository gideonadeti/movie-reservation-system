import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

import { AuditoriumsService } from './auditoriums.service';
import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'generated/prisma';
import { UserId } from 'src/user-id/user-id.decorator';

@ApiTags('Auditoriums')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auditoriums')
export class AuditoriumsController {
  constructor(private readonly auditoriumsService: AuditoriumsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(
    @UserId() userId: string,
    @Body() createAuditoriumDto: CreateAuditoriumDto,
  ) {
    return this.auditoriumsService.create(userId, createAuditoriumDto);
  }

  @Get()
  findAll() {
    return this.auditoriumsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditoriumsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id/reports')
  findReports(@UserId() userId: string, @Param('id') id: string) {
    return this.auditoriumsService.findReports(userId, id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateAuditoriumDto: UpdateAuditoriumDto,
  ) {
    return this.auditoriumsService.update(userId, id, updateAuditoriumDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@UserId() userId: string, @Param('id') id: string) {
    return this.auditoriumsService.remove(userId, id);
  }
}
