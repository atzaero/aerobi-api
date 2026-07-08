import { selectVisitImagesForPdf } from './select-visit-images-for-pdf';
import type { TechnicalVisitImage } from '@/generated/prisma/client';
import { TechnicalVisitImageSection } from '@/generated/prisma/client';

describe('selectVisitImagesForPdf', () => {
  const base = (
    overrides: Partial<TechnicalVisitImage>,
  ): TechnicalVisitImage => ({
    id: 'img-1',
    technicalVisitId: 'visit-1',
    section: TechnicalVisitImageSection.gates_padlocks,
    imageKey: 'k',
    originalFilename: 'a.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 100,
    uploadedBy: null,
    createdAt: new Date(),
    createdBy: null,
    updatedAt: new Date(),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  });

  it('limita por seção e total', () => {
    const sections = Object.values(TechnicalVisitImageSection);
    const images = sections.flatMap((section, sIdx) =>
      Array.from({ length: 5 }, (_, i) =>
        base({
          id: `${section}-${i}`,
          section,
          createdAt: new Date(sIdx * 10 + i),
        }),
      ),
    );
    const selected = selectVisitImagesForPdf(images);
    for (const section of sections) {
      expect(
        selected.filter((i) => i.section === section).length,
      ).toBeLessThanOrEqual(4);
    }
    expect(selected).toHaveLength(20);
  });

  it('descarta imagens acima do limite de bytes', () => {
    const selected = selectVisitImagesForPdf([
      base({ sizeBytes: 6 * 1024 * 1024 }),
      base({ id: 'ok', sizeBytes: 1024 }),
    ]);
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe('ok');
  });
});
