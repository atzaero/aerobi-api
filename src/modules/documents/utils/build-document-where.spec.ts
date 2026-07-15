import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { DocumentType } from '@/generated/prisma/client';

import { buildDocumentScopedWhere } from './build-document-where';

const aid = '22222222-2222-4222-8222-222222222222';

describe('buildDocumentScopedWhere', () => {
  it('scope none → fail-closed', () => {
    expect(buildDocumentScopedWhere({}, { kind: 'none' })).toEqual({
      id: { in: [] },
    });
  });

  it('scope all → filtros (type + search substring), sem grupo', () => {
    const scope: UserGroupScope = { kind: 'all' };
    expect(
      buildDocumentScopedWhere(
        { aerodromeId: aid, type: DocumentType.KML, search: 'plano' },
        scope,
      ),
    ).toEqual({
      aerodromeId: aid,
      type: DocumentType.KML,
      originalFilename: { contains: 'plano', mode: 'insensitive' },
    });
  });

  it('scope group → restringe via aerodrome.groupId', () => {
    const scope: UserGroupScope = { kind: 'group', groupId: 'grp-9' };
    expect(buildDocumentScopedWhere({}, scope)).toEqual({
      aerodrome: { groupId: 'grp-9' },
    });
  });
});
