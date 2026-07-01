import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import {
  type ActorGroupLookup,
  resolveActorGroupScope,
  resolveOperationalActorScope,
} from './group-scope.util';

const errorMessageService = new ErrorMessageService();

function lookupReturning(
  value: { groupId: string | null } | null,
): ActorGroupLookup {
  return { findActiveById: jest.fn().mockResolvedValue(value) };
}

describe('resolveActorGroupScope', () => {
  it('ADMIN → all, sem consultar o DB', async () => {
    const findActiveById = jest.fn().mockResolvedValue(null);
    const scope = await resolveActorGroupScope(
      UserRole.ADMIN,
      'a',
      { findActiveById },
      errorMessageService,
    );
    expect(scope).toEqual({ kind: 'all' });
    expect(findActiveById).not.toHaveBeenCalled();
  });

  it('COORDINATOR com grupo → group', async () => {
    const scope = await resolveActorGroupScope(
      UserRole.COORDINATOR,
      'c',
      lookupReturning({ groupId: 'group-9' }),
      errorMessageService,
    );
    expect(scope).toEqual({ kind: 'group', groupId: 'group-9' });
  });

  it('COORDINATOR sem grupo provisionado → none (não confunde com inativo)', async () => {
    const scope = await resolveActorGroupScope(
      UserRole.COORDINATOR,
      'c',
      lookupReturning({ groupId: null }),
      errorMessageService,
    );
    expect(scope).toEqual({ kind: 'none' });
  });

  it('COORDINATOR inativo/soft-deletado (registro null) → 401 ACCOUNT_DELETED', async () => {
    const promise = resolveActorGroupScope(
      UserRole.COORDINATOR,
      'c',
      lookupReturning(null),
      errorMessageService,
    );
    await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
    await promise.catch((e) => {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.ACCOUNT_DELETED,
      );
      expect((e as CustomHttpException).getStatus()).toBe(401);
    });
  });

  it('OPERATOR não é restrito na versão administrativa → all', async () => {
    const findActiveById = jest.fn().mockResolvedValue(null);
    const scope = await resolveActorGroupScope(
      UserRole.OPERATOR,
      'o',
      { findActiveById },
      errorMessageService,
    );
    expect(scope).toEqual({ kind: 'all' });
    expect(findActiveById).not.toHaveBeenCalled();
  });
});

describe('resolveOperationalActorScope', () => {
  it('ADMIN → all, sem consultar o DB', async () => {
    const findActiveById = jest.fn().mockResolvedValue(null);
    const scope = await resolveOperationalActorScope(
      UserRole.ADMIN,
      'a',
      { findActiveById },
      errorMessageService,
    );
    expect(scope).toEqual({ kind: 'all' });
    expect(findActiveById).not.toHaveBeenCalled();
  });

  it.each([UserRole.COORDINATOR, UserRole.OPERATOR, UserRole.TECHNICAL])(
    '%s com grupo → group (restrito ao próprio grupo)',
    async (role) => {
      const scope = await resolveOperationalActorScope(
        role,
        'x',
        lookupReturning({ groupId: 'group-7' }),
        errorMessageService,
      );
      expect(scope).toEqual({ kind: 'group', groupId: 'group-7' });
    },
  );

  it('OPERATOR sem grupo → none (fail-closed)', async () => {
    const scope = await resolveOperationalActorScope(
      UserRole.OPERATOR,
      'o',
      lookupReturning({ groupId: null }),
      errorMessageService,
    );
    expect(scope).toEqual({ kind: 'none' });
  });

  it('TECHNICAL inativo (registro null) → 401 ACCOUNT_DELETED', async () => {
    const promise = resolveOperationalActorScope(
      UserRole.TECHNICAL,
      't',
      lookupReturning(null),
      errorMessageService,
    );
    await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
    await promise.catch((e) => {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.ACCOUNT_DELETED,
      );
    });
  });
});
