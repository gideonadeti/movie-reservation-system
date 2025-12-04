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
  Query,
} from '@nestjs/common';

import { AuditoriumsService } from './auditoriums.service';
import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from 'src/auth/public.decorator';
import { FindAllAuditoriumsDto } from './dto/find-all-auditoriums.dto';

@ApiTags('Auditoriums')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('auditoriums')
export class AuditoriumsController {
  constructor(private readonly auditoriumsService: AuditoriumsService) {}

  @Post()
  create(@Body() createAuditoriumDto: CreateAuditoriumDto) {
    return this.auditoriumsService.create(createAuditoriumDto);
  }

  @Get()
  @Public()
  findAll(@Query() query: FindAllAuditoriumsDto) {
    return this.auditoriumsService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.auditoriumsService.findOne(id);
  }

  @Get(':id/reports')
  findReports(@Param('id') id: string) {
    return this.auditoriumsService.findReports(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuditoriumDto: UpdateAuditoriumDto,
  ) {
    return this.auditoriumsService.update(id, updateAuditoriumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditoriumsService.remove(id);
  }
}
