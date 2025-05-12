import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriumsService } from './auditoriums.service';

describe('AuditoriumsService', () => {
  let service: AuditoriumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditoriumsService],
    }).compile();

    service = module.get<AuditoriumsService>(AuditoriumsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
