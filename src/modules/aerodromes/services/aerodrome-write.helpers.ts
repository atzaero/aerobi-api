import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { isUniqueConstraintError } from '@/common/utils/prisma-error.util';

import { AerodromeRepository } from '../repositories/aerodrome.repository';

/**
 * Garante que o grupo existe e está ativo (paridade: o web deriva a UF do grupo
 * e lança `VALIDATION_FAILED` quando inválido/removido). Compartilhado por create
 * e update para não manter a mesma checagem duplicada e sujeita a drift.
 */
export async function assertActiveGroup(
  repo: AerodromeRepository,
  errorMessageService: ErrorMessageService,
  groupId: string,
): Promise<void> {
  const group = await repo.findActiveGroup(groupId);
  if (!group) {
    throw httpError(
      errorMessageService,
      ErrorCode.VALIDATION_FAILED,
      HttpStatus.BAD_REQUEST,
      { DETAILS: 'Grupo inválido ou inexistente' },
    );
  }
}

/**
 * Converte a violação de `@@unique([groupId, icao])` (Prisma P2002) num 409
 * `CONFLICT` com a mensagem padrão do ICAO; qualquer outro erro é relançado
 * intacto. Um único ponto de verdade para o catch de create e update.
 */
export function rethrowAerodromeUniqueConflict(
  err: unknown,
  errorMessageService: ErrorMessageService,
  icao: string,
): never {
  if (isUniqueConstraintError(err)) {
    throw httpError(
      errorMessageService,
      ErrorCode.CONFLICT,
      HttpStatus.CONFLICT,
      { DETAILS: `Já existe um aeródromo ${icao} neste grupo` },
    );
  }
  throw err;
}
