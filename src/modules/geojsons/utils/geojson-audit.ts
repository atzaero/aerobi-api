import type {
  Geojson,
  GeojsonKind,
  GeojsonStatus,
} from '@/generated/prisma/client';

/**
 * Recorte estável de um GeoJSON operacional para os snapshots `before`/`after`
 * da auditoria. Projeta só identificadores/estado — **nunca** o payload GeoJSON
 * (volumoso) nem dados voláteis (URLs presigned/versionHash) — mantendo a trilha
 * append-only enxuta. Segue o padrão de `landingRequestAuditSnapshot`.
 */
export function geojsonAuditSnapshot(entity: Geojson): {
  id: string;
  aerodromeId: string;
  status: GeojsonStatus;
  kind: GeojsonKind;
} {
  return {
    id: entity.id,
    aerodromeId: entity.aerodromeId,
    status: entity.status,
    kind: entity.kind,
  };
}
