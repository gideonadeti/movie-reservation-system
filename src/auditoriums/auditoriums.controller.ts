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
import { Public } from 'src/auth/public.decorator';

@ApiTags('Auditoriums')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('auditoriums')
export class AuditoriumsController {
  constructor(private readonly auditoriumsService: AuditoriumsService) {}

  @Post()
  create(
    @UserId() userId: string,
    @Body() createAuditoriumDto: CreateAuditoriumDto,
  ) {
    return this.auditoriumsService.create(userId, createAuditoriumDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.auditoriumsService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.auditoriumsService.findOne(id);
  }

  @Get(':id/reports')
  findReports(@UserId() userId: string, @Param('id') id: string) {
    return this.auditoriumsService.findReports(userId, id);
  }

  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateAuditoriumDto: UpdateAuditoriumDto,
  ) {
    return this.auditoriumsService.update(userId, id, updateAuditoriumDto);
  }

  @Delete(':id')
  remove(@UserId() userId: string, @Param('id') id: string) {
    return this.auditoriumsService.remove(userId, id);
  }
}
