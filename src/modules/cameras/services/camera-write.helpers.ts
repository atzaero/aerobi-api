import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { httpError } from '@/common/exceptions/http-error.util';
import { isUniqueConstraintError } from '@/common/utils/prisma-error.util';

import { CameraRepository } from '../repositories/camera.repository';
import type { StreamIdentity } from '../repositories/camera.repository.interface';

/**
 * Rejeita (409) se já existe uma câmera **ativa** com o mesmo trio
 * `(icao, mediamtxNode, mediamtxPath)`. Pré-check para uma mensagem amigável; o
 * índice único parcial no banco é a garantia final contra a corrida entre a
 * checagem e o `create`/`update` (ver {@link rethrowCameraStreamConflict}).
 */
export async function assertStreamUnique(
  repo: CameraRepository,
  errorMessageService: ErrorMessageService,
  identity: StreamIdentity,
): Promise<void> {
  const conflict = await repo.findActiveStreamConflict(identity);
  if (conflict) {
    throw streamConflict(errorMessageService, identity);
  }
}

/**
 * Converte a violação do índice único parcial (Prisma `P2002`) num 409
 * `CONFLICT`; qualquer outro erro é relançado intacto. Rede de segurança para a
 * corrida entre o pré-check e o `create`/`update`.
 */
export function rethrowCameraStreamConflict(
  err: unknown,
  errorMessageService: ErrorMessageService,
  identity: StreamIdentity,
): never {
  if (isUniqueConstraintError(err)) {
    throw streamConflict(errorMessageService, identity);
  }
  throw err;
}

/** Monta o 409 padrão de stream duplicado (mensagem única para pré-check e catch). */
function streamConflict(
  errorMessageService: ErrorMessageService,
  identity: StreamIdentity,
): CustomHttpException {
  return httpError(
    errorMessageService,
    ErrorCode.CONFLICT,
    HttpStatus.CONFLICT,
    {
      DETAILS: `Já existe uma câmera ativa com o stream ${identity.icao}/${identity.mediamtxNode}/${identity.mediamtxPath}`,
    },
  );
}
