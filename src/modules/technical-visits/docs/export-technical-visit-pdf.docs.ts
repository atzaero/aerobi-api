import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';

export function ExportTechnicalVisitPdfDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Exporta visita técnica em PDF' }),
    ApiProduces('application/pdf'),
    ApiOkResponse({ description: 'PDF da visita técnica' }),
  );
}
