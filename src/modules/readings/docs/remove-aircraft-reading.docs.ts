import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { AircraftReadingResponseDTO } from '../dtos/aircraft-reading-response.dto';

export function RemoveAircraftReadingDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Remove (soft delete) uma leitura por id.' }),
    ApiOkResponse({ type: AircraftReadingResponseDTO }),
    ApiNotFoundResponse({ description: 'Leitura não encontrada.' }),
  );
}
