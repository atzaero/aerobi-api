import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { GeojsonMapFileType } from '@/generated/prisma/client';

import { deriveMapFileType } from './convert-aerodrome-source';

/**
 * Valida o arquivo-fonte KML/KMZ recebido no endpoint de (re)geração: presença,
 * conteúdo não-vazio e extensão `.kml`/`.kmz`. Devolve `{ fileType, buffer }`
 * para a conversão. Falha com 400 `VALIDATION_FAILED` (via `httpError`).
 */
export function assertGeojsonSourceFile(
  file: Express.Multer.File | undefined,
  errorMessageService: ErrorMessageService,
): { fileType: GeojsonMapFileType; buffer: Buffer } {
  if (!file || !file.buffer || file.size === 0) {
    throw httpError(
      errorMessageService,
      ErrorCode.VALIDATION_FAILED,
      HttpStatus.BAD_REQUEST,
      { DETAILS: 'arquivo KML/KMZ ausente ou vazio (campo `file`)' },
    );
  }

  const name = (file.originalname ?? '').toLowerCase();
  if (!name.endsWith('.kml') && !name.endsWith('.kmz')) {
    throw httpError(
      errorMessageService,
      ErrorCode.VALIDATION_FAILED,
      HttpStatus.BAD_REQUEST,
      { DETAILS: 'formato inválido — use um arquivo .kml ou .kmz' },
    );
  }

  return { fileType: deriveMapFileType(name), buffer: file.buffer };
}
