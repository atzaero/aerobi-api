import { Injectable, Logger } from '@nestjs/common';

import {
  AuditAction,
  type Geojson,
  type GeojsonMapFileType,
} from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';

import { GeojsonRepository } from '../repositories/geojson.repository';
import { buildGeojsonUpsertInput } from '../utils/build-geojson-upsert-input';
import { convertAerodromeSource } from '../utils/convert-aerodrome-source';
import { geojsonAuditSnapshot } from '../utils/geojson-audit';
import {
  buildGeojsonErrorContent,
  decideGeojsonContent,
  type GeojsonContentDecision,
} from '../utils/geojson-content';

/**
 * Entrada da geração. `sourceStoragePath` é o metadado de origem (o KML/KMZ vive
 * no módulo `documents` #366; no endpoint admin de regeneração fica `null`).
 */
export interface GenerateGeojsonInput {
  aerodromeId: string;
  fileType: GeojsonMapFileType;
  buffer: Buffer;
  actorId: string;
  sourceStoragePath?: string | null;
}

export type GenerateGeojsonOutcome = 'READY' | 'ERROR' | 'SKIPPED';

/** `geojson` é `null` só no `SKIPPED` (aeródromo inexistente/soft-deletado). */
export interface GenerateGeojsonResult {
  status: GenerateGeojsonOutcome;
  geojson: Geojson | null;
}

/**
 * Caso de uso server-side de geração KML/KMZ → GeoJSON, **best-effort**: nunca
 * lança para o chamador. Espelha `generateAndSaveAerodromeGeojson` do web:
 *
 *  - **skip** se o aeródromo pai não existe (o web pula quando falta
 *    icao/uf/group_id — na API esses são colunas obrigatórias, logo a existência
 *    do aeródromo já garante os derivados de leitura);
 *  - converte e decide `READY`/`ERROR` pelo limite inline (falha de
 *    conversão/limite → `ERROR`, sem relançar);
 *  - **upsert determinístico por `aerodromeId`** reusando o registro existente
 *    (inclusive soft-deletado → re-ativa), com ator real em `createdBy`/
 *    `updatedBy` e trilha de auditoria (`CREATE`/`UPDATE`).
 *
 * Exportado pelo `GeojsonsModule` para o `documents` (#366) disparar no upload de
 * KML/KMZ; o endpoint admin de regeneração o consome diretamente.
 */
@Injectable()
export class GenerateGeojsonService {
  private readonly logger = new Logger(GenerateGeojsonService.name);

  constructor(
    private readonly repo: GeojsonRepository,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    input: GenerateGeojsonInput,
    auditContext: RecordAuditContext = {},
  ): Promise<GenerateGeojsonResult> {
    const { aerodromeId, fileType, buffer, actorId } = input;

    if (!(await this.repo.aerodromeExists(aerodromeId))) {
      this.logger.warn(
        `Aeródromo ${aerodromeId} inexistente/soft-deletado — GeoJSON não gerado (skip).`,
      );
      return { status: 'SKIPPED', geojson: null };
    }

    const startedAt = Date.now();
    let decision: GeojsonContentDecision;
    try {
      const converted = await convertAerodromeSource(fileType, buffer);
      decision = decideGeojsonContent(converted);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Falha ao converter GeoJSON do aeródromo ${aerodromeId}: ${message}`,
      );
      decision = buildGeojsonErrorContent(message);
    }

    const existing = await this.repo.findByAerodromeIdAnyState(aerodromeId);
    const { create, update } = buildGeojsonUpsertInput(
      {
        aerodromeId,
        mapFileType: fileType,
        sourceStoragePath: input.sourceStoragePath ?? null,
        generatedAt: new Date(),
        processingMs: Date.now() - startedAt,
        actorId,
      },
      decision,
    );

    const saved = await this.repo.upsertByAerodromeId(
      aerodromeId,
      create,
      update,
    );

    await this.auditRecorder.record(
      {
        action: existing ? AuditAction.UPDATE : AuditAction.CREATE,
        entityType: 'geojson',
        entityId: saved.id,
        before: existing ? geojsonAuditSnapshot(existing) : undefined,
        after: geojsonAuditSnapshot(saved),
        metadata: {
          scope: 'generate',
          aerodromeId,
          status: saved.status,
          mapFileType: saved.mapFileType,
          featureCount: saved.featureCount,
          geoJsonBytes: saved.geoJsonBytes,
        },
      },
      auditContext,
    );

    return { status: decision.status, geojson: saved };
  }
}
