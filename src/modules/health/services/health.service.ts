import { Injectable } from '@nestjs/common';

import { HealthResponseDto } from '../dtos/health-response.dto';

@Injectable()
export class HealthService {
  execute(): HealthResponseDto {
    return { status: 'ok', service: 'aerobi-api' };
  }
}
