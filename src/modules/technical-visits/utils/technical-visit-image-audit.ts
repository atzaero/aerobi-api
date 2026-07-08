import type { TechnicalVisitImage } from '@/generated/prisma/client';

/** Snapshot mínimo de imagem de visita técnica para o audit log (sem key/URL). */
export function technicalVisitImageAuditSnapshot(image: TechnicalVisitImage) {
  return {
    id: image.id,
    technicalVisitId: image.technicalVisitId,
    section: image.section,
    originalFilename: image.originalFilename,
  };
}
