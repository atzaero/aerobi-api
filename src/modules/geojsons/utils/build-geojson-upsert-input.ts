import {
  GeojsonKind,
  GeojsonMapFileType,
  GeojsonStatus,
  Prisma,
} from '@/generated/prisma/client';

import type { GeojsonContentDecision } from './geojson-content';

/**
 * Metadados de identidade/origem da geração (o que não vem do conteúdo
 * convertido). O `actorId` alimenta `createdBy`/`updatedBy` (ator real).
 */
export interface GeojsonGenerateIdentity {
  aerodromeId: string;
  mapFileType: GeojsonMapFileType;
  sourceStoragePath: string | null;
  generatedAt: Date;
  processingMs: number;
  actorId: string;
}

/**
 * Campos de conteúdo no formato aceito pelo Prisma. No ERROR o payload é zerado
 * (`geoJson` vira `Prisma.DbNull` = SQL NULL) e as métricas de origem **não** são
 * escritas (num re-upsert sobre um READY anterior elas ficam preservadas, como no
 * web). No READY escreve o objeto + todas as métricas.
 */
function buildContentFields(decision: GeojsonContentDecision) {
  if (decision.status === 'ERROR') {
    return {
      status: GeojsonStatus.ERROR,
      geoJson: Prisma.DbNull,
      geoJsonBytes: 0,
      featureCount: 0,
      errorMessage: decision.errorMessage,
    };
  }

  return {
    status: GeojsonStatus.READY,
    geoJson: decision.geoJson as Prisma.InputJsonValue,
    geoJsonBytes: decision.geoJsonBytes,
    featureCount: decision.featureCount,
    errorMessage: null,
    sourceBytes: decision.sourceBytes,
    kmlTextBytes: decision.kmlTextBytes,
    zipBytes: decision.zipBytes,
    versionHash: decision.versionHash,
  };
}

/**
 * Monta os inputs `create`/`update` do upsert determinístico por
 * `aerodromeId`. O `update` limpa `deletedAt`/`deletedBy` para **re-ativar** um
 * registro soft-deletado (espelha o `merge` que zera a auditoria no web) e
 * preserva `createdBy` (só o `create` o define). Chamado por
 * `GenerateGeojsonService`.
 */
export function buildGeojsonUpsertInput(
  identity: GeojsonGenerateIdentity,
  decision: GeojsonContentDecision,
): { create: Prisma.GeojsonCreateInput; update: Prisma.GeojsonUpdateInput } {
  const content = buildContentFields(decision);
  const common = {
    kind: GeojsonKind.AERODROME_MAP,
    mapFileType: identity.mapFileType,
    sourceStoragePath: identity.sourceStoragePath,
    generatedAt: identity.generatedAt,
    processingMs: identity.processingMs,
    ...content,
  };

  return {
    create: {
      ...common,
      aerodrome: { connect: { id: identity.aerodromeId } },
      createdBy: identity.actorId,
      updatedBy: identity.actorId,
    },
    update: {
      ...common,
      updatedBy: identity.actorId,
      deletedAt: null,
      deletedBy: null,
    },
  };
}
