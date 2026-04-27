import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { HealthDocs } from '../docs/health.docs';
import { HealthResponseDto } from '../dtos/health-response.dto';
import { HealthService } from '../services/health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthDocs()
  async handle(): Promise<HealthResponseDto> {
    return this.healthService.execute();
  }
}
