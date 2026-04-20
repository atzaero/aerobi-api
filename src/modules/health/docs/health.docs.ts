import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { HealthResponseDto } from '../dtos/health-response.dto';

export function HealthDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Check API health status',
      description:
        'Returns diagnostics including status, timestamp, uptime, environment, version, memory usage and database connectivity.',
    }),
    ApiResponse({
      status: 200,
      description: 'API is healthy and the database is reachable.',
      type: HealthResponseDto,
    }),
    ApiResponse({
      status: 503,
      description:
        'Service unavailable: database is unreachable. Payload mirrors the healthy shape with status "error" and database.error filled in.',
      type: HealthResponseDto,
    }),
  );
}
