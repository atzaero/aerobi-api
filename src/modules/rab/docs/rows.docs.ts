import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

export function RowsDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Consulta paginada de linhas RAB por período (dados abertos ANAC)',
    }),
    ApiQuery({ name: 'period', required: true, example: '2026-03' }),
    ApiQuery({ name: 'skip', required: false }),
    ApiQuery({ name: 'take', required: false }),
  );
}
