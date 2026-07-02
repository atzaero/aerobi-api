import { applyDecorators, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';

export function ExportContactsDocs() {
  return applyDecorators(
    Get('export'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Exporta mensagens de contato em CSV (ADMIN)',
    }),
    ApiProduces('text/csv'),
    ApiOkResponse({ schema: { type: 'string', format: 'binary' } }),
    ApiForbiddenResponse(),
  );
}
