import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function SyncDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Disparar sincronização (sem auth em dev — reativar guard antes de produção)',
    }),
    ApiResponse({ status: 200, description: 'Resultado da sync' }),
  );
}
