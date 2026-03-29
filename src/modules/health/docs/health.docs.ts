import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { HealthResponseDto } from '../dtos/health-response.dto';

export function HealthDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Health check' }),
    ApiResponse({ status: 200, type: HealthResponseDto }),
  );
}
