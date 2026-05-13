import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import { assertAdmin, assertSelfOrAdmin } from './user-access.util';

const errorMessages = new ErrorMessageService();

describe('assertSelfOrAdmin', () => {
  it('passa quando actor é ADMIN, mesmo com targetUserId diferente', () => {
    expect(() =>
      assertSelfOrAdmin(
        { id: 'admin-1', email: 'a@x', role: UserRole.ADMIN },
        'user-2',
        errorMessages,
      ),
    ).not.toThrow();
  });

  it('passa quando actor.id === targetUserId', () => {
    expect(() =>
      assertSelfOrAdmin(
        { id: 'user-1', email: 'a@x', role: UserRole.OPERATOR },
        'user-1',
        errorMessages,
      ),
    ).not.toThrow();
  });

  it('lança OWNERSHIP_VIOLATION quando actor é não-ADMIN e id diferente', () => {
    try {
      assertSelfOrAdmin(
        { id: 'user-1', email: 'a@x', role: UserRole.OPERATOR },
        'user-2',
        errorMessages,
      );
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.OWNERSHIP_VIOLATION,
      );
    }
  });
});

describe('assertAdmin', () => {
  it('passa quando actor é ADMIN', () => {
    expect(() =>
      assertAdmin(
        { id: 'a', email: 'a@x', role: UserRole.ADMIN },
        errorMessages,
      ),
    ).not.toThrow();
  });

  it('lança o errorCode informado quando não é ADMIN', () => {
    try {
      assertAdmin(
        { id: 'u', email: 'u@x', role: UserRole.OPERATOR },
        errorMessages,
        ErrorCode.ROLE_CHANGE_FORBIDDEN,
      );
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.ROLE_CHANGE_FORBIDDEN,
      );
    }
  });
});
