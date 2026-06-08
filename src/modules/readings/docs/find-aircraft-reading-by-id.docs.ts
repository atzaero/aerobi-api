import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';

import { AircraftReadingResponseDTO } from '../dtos/aircraft-reading-response.dto';

export function FindAircraftReadingByIdDocs() {
  return applyDecorators(
    ApiSecurity('api_key'),
    ApiOperation({ summary: 'Busca uma leitura por id.' }),
    ApiOkResponse({ type: AircraftReadingResponseDTO }),
    ApiNotFoundResponse({ description: 'Leitura não encontrada.' }),
  );
}
