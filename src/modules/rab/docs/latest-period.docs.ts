import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function LatestPeriodDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Último período YYYY-MM listado no índice ANAC (sem gravar)',
    }),
  );
}
