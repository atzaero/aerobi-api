import type { TechnicalVisitImage } from '@/generated/prisma/client';
import { TechnicalVisitImageSection } from '@/generated/prisma/client';

const t = new Date('2024-06-01T12:00:00.000Z');

export function buildTechnicalVisitImageFixture(
  overrides: Partial<TechnicalVisitImage> = {},
): TechnicalVisitImage {
  return {
    id: '99999999-9999-4999-8999-999999999999',
    technicalVisitId: '11111111-1111-4111-8111-111111111111',
    section: TechnicalVisitImageSection.fence,
    imageKey:
      'technical-visits/11111111-1111-4111-8111-111111111111/fence/img.jpg',
    originalFilename: 'foto.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024,
    uploadedBy: '33333333-3333-4333-8333-333333333333',
    createdAt: t,
    createdBy: '33333333-3333-4333-8333-333333333333',
    updatedAt: t,
    updatedBy: '33333333-3333-4333-8333-333333333333',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
