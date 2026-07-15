import { DocumentType } from '@/generated/prisma/client';

import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { DocumentMapper } from './document.mapper';

describe('DocumentMapper', () => {
  it('expõe type em lowercase, injeta url e omite storageKey/deleted*', () => {
    const entity = buildDocumentFixture({ type: DocumentType.PLAN_ORDINANCE });
    const row = DocumentMapper.toApiRow(entity, 'https://signed');

    expect(row).toMatchObject({
      id: entity.id,
      aerodromeId: entity.aerodromeId,
      uf: 'MG',
      type: 'plan_ordinance',
      originalFilename: 'doc.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1234,
      url: 'https://signed',
    });
    expect(row).not.toHaveProperty('storageKey');
    expect(row).not.toHaveProperty('deletedAt');
    expect(typeof row.createdAt).toBe('string');
  });

  it('url null quando o presigned falha', () => {
    const row = DocumentMapper.toApiRow(buildDocumentFixture(), null);
    expect(row.url).toBeNull();
  });
});
