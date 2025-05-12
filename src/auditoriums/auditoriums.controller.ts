import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuditoriumsService } from './auditoriums.service';
import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';

@Controller('auditoriums')
export class AuditoriumsController {
  constructor(private readonly auditoriumsService: AuditoriumsService) {}

  @Post()
  create(@Body() createAuditoriumDto: CreateAuditoriumDto) {
    return this.auditoriumsService.create(createAuditoriumDto);
  }

  @Get()
  findAll() {
    return this.auditoriumsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditoriumsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuditoriumDto: UpdateAuditoriumDto) {
    return this.auditoriumsService.update(+id, updateAuditoriumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditoriumsService.remove(+id);
  }
}
