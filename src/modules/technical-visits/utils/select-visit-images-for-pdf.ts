import type { TechnicalVisitImage } from '@/generated/prisma/client';

export interface VisitImageLimits {
  maxPerSection: number;
  maxTotal: number;
  maxBytes: number;
}

export const DEFAULT_VISIT_IMAGE_LIMITS: VisitImageLimits = {
  maxPerSection: 4,
  maxTotal: 20,
  maxBytes: 5 * 1024 * 1024,
};

/**
 * Seleciona fotos para o PDF (≤4/seção, ≤20 total, ≤5MB) — paridade
 * `selectVisitImagesForPdf` do web.
 */
export function selectVisitImagesForPdf(
  images: readonly TechnicalVisitImage[],
  limits: VisitImageLimits = DEFAULT_VISIT_IMAGE_LIMITS,
): TechnicalVisitImage[] {
  const perSection = new Map<string, number>();
  const selected: TechnicalVisitImage[] = [];

  for (const image of images) {
    if (selected.length >= limits.maxTotal) break;
    if (image.sizeBytes > limits.maxBytes) continue;
    const count = perSection.get(image.section) ?? 0;
    if (count >= limits.maxPerSection) continue;
    perSection.set(image.section, count + 1);
    selected.push(image);
  }

  return selected;
}
