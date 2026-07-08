import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { assertAerodromeOperationalScope } from './assert-aerodrome-operational-scope';

describe('assertAerodromeOperationalScope', () => {
  const aerodromeId = '22222222-2222-4222-8222-222222222222';
  const aerodrome = { groupId: 'g1' };
  const errors = { getMessage: jest.fn() } as unknown as ErrorMessageService;

  it('404 quando aeródromo não existe (null)', () => {
    expect(() =>
      assertAerodromeOperationalScope(
        null,
        { kind: 'all' },
        errors,
        aerodromeId,
      ),
    ).toThrow(CustomHttpException);
  });

  it('404 quando scope é none (sem grupo provisionado)', () => {
    expect(() =>
      assertAerodromeOperationalScope(
        aerodrome,
        { kind: 'none' },
        errors,
        aerodromeId,
      ),
    ).toThrow(CustomHttpException);
  });

  it('404 quando aeródromo está fora do grupo do ator', () => {
    expect(() =>
      assertAerodromeOperationalScope(
        aerodrome,
        { kind: 'group', groupId: 'other' },
        errors,
        aerodromeId,
      ),
    ).toThrow(CustomHttpException);
  });

  it('passa quando escopo all', () => {
    expect(() =>
      assertAerodromeOperationalScope(
        aerodrome,
        { kind: 'all' } satisfies UserGroupScope,
        errors,
        aerodromeId,
      ),
    ).not.toThrow();
  });

  it('passa quando o grupo coincide', () => {
    expect(() =>
      assertAerodromeOperationalScope(
        aerodrome,
        { kind: 'group', groupId: 'g1' },
        errors,
        aerodromeId,
      ),
    ).not.toThrow();
  });
});
