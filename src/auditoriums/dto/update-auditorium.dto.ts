import { PartialType } from '@nestjs/swagger';
import { CreateAuditoriumDto } from './create-auditorium.dto';

export class UpdateAuditoriumDto extends PartialType(CreateAuditoriumDto) {}
