import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import type { RabRow } from '@/generated/prisma/client';
import { RabRowRepository } from '@/modules/rab/repositories/rab-row.repository';

import { normalizeRabMarcas } from '../utils/rab-marcas.util';

/**
 * Resolve o snapshot RAB da aeronave no create público (espelha
 * `validate-rab-registration.ts` do web). Matrícula **estrangeira** pula a
 * checagem (sem snapshot). Para matrícula nacional, faz match exato pela forma
 * canônica das `marcas` (sem hífen) via `findLatestByMarcas` — o mesmo lookup
 * que o módulo `movements` usa, lendo o RAB já sincronizado no Postgres (sem
 * dependência de rede nem caso "ambíguo" do `contains`).
 *
 * Não encontrada → `VALIDATION_FAILED` (400). Encontrada → o `RabRow` que o
 * create grava como snapshot.
 */
@Injectable()
export class LookupRabAircraftService {
  constructor(
    private readonly rabRowRepository: RabRowRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    aircraftRegistration: string,
    foreignRegistration: boolean,
  ): Promise<RabRow | null> {
    if (foreignRegistration) {
      return null;
    }

    const marcas = normalizeRabMarcas(aircraftRegistration);
    const row = await this.rabRowRepository.findLatestByMarcas(marcas);
    if (!row) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        {
          DETAILS:
            'matrícula não encontrada no RAB; verifique a matrícula informada',
        },
      );
    }

    return row;
  }
}
