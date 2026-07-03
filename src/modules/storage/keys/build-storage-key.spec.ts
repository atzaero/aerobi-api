import { buildStorageKey } from './build-storage-key';
import { buildUniqueLeaf, buildUuidLeaf } from './filename.util';
import { isValidDocType } from './storage-doc-type';
import { StorageDomain } from './storage-domain.enum';

const UUID = '11111111-2222-3333-4444-555555555555';

describe('buildStorageKey', () => {
  it('monta a key canônica {domain}/{itemId}/{docType}/{leaf}', () => {
    const key = buildStorageKey({
      domain: StorageDomain.MOVEMENTS,
      itemId: 'mov-123',
      docType: 'image',
      leaf: buildUuidLeaf(UUID, 'jpg'),
    });
    expect(key).toBe(`movements/mov-123/image/${UUID}.jpg`);
  });

  it('suporta leaf com slug para pastas de múltiplos arquivos', () => {
    const key = buildStorageKey({
      domain: StorageDomain.AERODROMES,
      itemId: 'aero-1',
      docType: 'plan_ordinance',
      leaf: buildUniqueLeaf(UUID, 'Portaria Final.pdf'),
    });
    expect(key).toBe(
      `aerodromes/aero-1/plan_ordinance/${UUID}-portaria-final.pdf`,
    );
  });

  it('usa a seção como docType para technical-visits', () => {
    const key = buildStorageKey({
      domain: StorageDomain.TECHNICAL_VISITS,
      itemId: 'visit-9',
      docType: 'gates_padlocks',
      leaf: buildUuidLeaf(UUID, 'webp'),
    });
    expect(key).toBe(`technical-visits/visit-9/gates_padlocks/${UUID}.webp`);
  });

  it('rejeita docType fora do vocabulário do domínio', () => {
    expect(() =>
      buildStorageKey({
        domain: StorageDomain.GROUPS,
        itemId: 'g1',
        docType: 'avatar',
        leaf: buildUuidLeaf(UUID, 'jpg'),
      }),
    ).toThrow(/docType "avatar" inválido/);
  });

  it('rejeita itemId vazio ou com "/"', () => {
    expect(() =>
      buildStorageKey({
        domain: StorageDomain.USERS,
        itemId: '  ',
        docType: 'avatar',
        leaf: buildUuidLeaf(UUID, 'jpg'),
      }),
    ).toThrow(/itemId/);

    expect(() =>
      buildStorageKey({
        domain: StorageDomain.USERS,
        itemId: 'a/b',
        docType: 'avatar',
        leaf: buildUuidLeaf(UUID, 'jpg'),
      }),
    ).toThrow(/itemId/);
  });

  it('rejeita leaf vazia ou com "/"', () => {
    expect(() =>
      buildStorageKey({
        domain: StorageDomain.USERS,
        itemId: 'u1',
        docType: 'avatar',
        leaf: '',
      }),
    ).toThrow(/leaf/);

    expect(() =>
      buildStorageKey({
        domain: StorageDomain.USERS,
        itemId: 'u1',
        docType: 'avatar',
        leaf: 'sub/dir.jpg',
      }),
    ).toThrow(/leaf/);
  });
});

describe('isValidDocType', () => {
  it('valida contra o vocabulário do domínio', () => {
    expect(isValidDocType(StorageDomain.USERS, 'avatar')).toBe(true);
    expect(isValidDocType(StorageDomain.USERS, 'identity_document')).toBe(true);
    expect(isValidDocType(StorageDomain.GROUPS, 'images')).toBe(true);
    expect(isValidDocType(StorageDomain.GROUPS, 'image')).toBe(false);
  });
});
