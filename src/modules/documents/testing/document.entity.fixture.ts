import { DocumentType, type Document } from '@/generated/prisma/client';

const t = new Date('2026-01-02T03:04:05.000Z');

export function buildDocumentFixture(
  overrides: Partial<Document> = {},
): Document {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    aerodromeId: '22222222-2222-4222-8222-222222222222',
    uf: 'MG',
    type: DocumentType.EXTRA,
    storageKey:
      'aerodromes/22222222-2222-4222-8222-222222222222/extra/abc-doc.pdf',
    originalFilename: 'doc.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1234,
    uploadedBy: null,
    createdAt: t,
    createdBy: null,
    updatedAt: t,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
