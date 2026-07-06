import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { Uf } from '@/generated/prisma/client';

import { assertAerodromeInScope } from './assert-aerodrome-in-scope';

const ems = new ErrorMessageService();
const aid = '22222222-2222-4222-8222-222222222222';
const aerodrome = { groupId: 'grp-1', uf: Uf.MG };

describe('assertAerodromeInScope', () => {
  it('all → passa e devolve o aeródromo', () => {
    expect(assertAerodromeInScope(aerodrome, { kind: 'all' }, ems, aid)).toBe(
      aerodrome,
    );
  });

  it('group do mesmo grupo → passa', () => {
    const scope: UserGroupScope = { kind: 'group', groupId: 'grp-1' };
    expect(assertAerodromeInScope(aerodrome, scope, ems, aid)).toBe(aerodrome);
  });

  it('inexistente → 404', () => {
    expect(() =>
      assertAerodromeInScope(null, { kind: 'all' }, ems, aid),
    ).toThrow(CustomHttpException);
  });

  it('group de outro grupo → 404 (não vaza existência)', () => {
    const scope: UserGroupScope = { kind: 'group', groupId: 'outro' };
    expect(() => assertAerodromeInScope(aerodrome, scope, ems, aid)).toThrow(
      CustomHttpException,
    );
  });

  it('none → 404', () => {
    expect(() =>
      assertAerodromeInScope(aerodrome, { kind: 'none' }, ems, aid),
    ).toThrow(CustomHttpException);
  });
});
