import { Injectable } from '@nestjs/common';
import { CreateAuditoriumDto } from './dto/create-auditorium.dto';
import { UpdateAuditoriumDto } from './dto/update-auditorium.dto';

@Injectable()
export class AuditoriumsService {
  create(createAuditoriumDto: CreateAuditoriumDto) {
    return 'This action adds a new auditorium';
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
