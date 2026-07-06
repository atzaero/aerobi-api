import { DocumentType } from '@/generated/prisma/client';

import { buildDocumentStorageKey } from './document-storage';

const aid = '22222222-2222-4222-8222-222222222222';

describe('buildDocumentStorageKey', () => {
  it('monta aerodromes/{id}/{docType}/{uuid}-{slug} (docType lowercase)', () => {
    const key = buildDocumentStorageKey(
      aid,
      DocumentType.PLAN_ORDINANCE,
      'Plano Básico.pdf',
    );
    expect(key).toMatch(
      new RegExp(
        `^aerodromes/${aid}/plan_ordinance/[0-9a-f-]{36}-plano-basico\\.pdf$`,
      ),
    );
  });

  it('cada chamada gera leaf único (uuid) — nunca sobrescreve', () => {
    const a = buildDocumentStorageKey(aid, DocumentType.EXTRA, 'x.pdf');
    const b = buildDocumentStorageKey(aid, DocumentType.EXTRA, 'x.pdf');
    expect(a).not.toBe(b);
  });
});
