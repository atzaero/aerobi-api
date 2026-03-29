import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function SyncStateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Estados de sincronização por período' }),
  );
}
