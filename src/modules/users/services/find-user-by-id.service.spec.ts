import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { User } from '@/generated/prisma/client';
import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserRepository } from '../repositories/user.repository';
import { buildUserFixture } from '../testing/user.fixtures';

import { FindUserByIdService } from './find-user-by-id.service';

const coordRecord = buildUserFixture({
  id: 'coord-1',
  role: UserRole.COORDINATOR,
  groupId: 'g1',
});

describe('FindUserByIdService (leitura escopada)', () => {
  let service: FindUserByIdService;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    const userRepository = { findActiveById } as unknown as UserRepository;
    service = new FindUserByIdService(
      userRepository,
      new ErrorMessageService(),
    );
  });

  function withRepo(target: User | null, actorRecord: User = coordRecord) {
    findActiveById.mockImplementation((uid: string) => {
      if (uid === actorRecord.id) return actorRecord;
      if (target && uid === target.id) return target;
      return null;
    });
  }

  async function expectNotFound(promise: Promise<unknown>): Promise<void> {
    await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
    await promise.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.USER_NOT_FOUND,
      ),
    );
  }

  it('self (qualquer papel) lê o próprio perfil', async () => {
    const self = buildUserFixture({ id: 'op-1', role: UserRole.OPERATOR });
    withRepo(self);
    const actor: AuthenticatedUser = {
      id: 'op-1',
      email: 'o@x',
      role: UserRole.OPERATOR,
    };

    const result = await service.execute('op-1', actor);
    expect(result.id).toBe('op-1');
  });

  it('ADMIN lê qualquer usuário', async () => {
    withRepo(buildUserFixture({ id: 'u-9' }));
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'a@x',
      role: UserRole.ADMIN,
    };

    const result = await service.execute('u-9', actor);
    expect(result.id).toBe('u-9');
  });

  it('COORDINATOR lê membro do próprio grupo', async () => {
    withRepo(
      buildUserFixture({ id: 'op-1', role: UserRole.OPERATOR, groupId: 'g1' }),
    );
    const actor: AuthenticatedUser = {
      id: 'coord-1',
      email: 'c@x',
      role: UserRole.COORDINATOR,
    };

    const result = await service.execute('op-1', actor);
    expect(result.id).toBe('op-1');
  });

  it('COORDINATOR não lê membro de outro grupo → USER_NOT_FOUND', async () => {
    withRepo(
      buildUserFixture({ id: 'op-2', role: UserRole.OPERATOR, groupId: 'g2' }),
    );
    const actor: AuthenticatedUser = {
      id: 'coord-1',
      email: 'c@x',
      role: UserRole.COORDINATOR,
    };

    await expectNotFound(service.execute('op-2', actor));
  });

  it('OPERATOR não lê o perfil de outro → USER_NOT_FOUND', async () => {
    withRepo(buildUserFixture({ id: 'op-2', role: UserRole.OPERATOR }));
    const actor: AuthenticatedUser = {
      id: 'op-1',
      email: 'o@x',
      role: UserRole.OPERATOR,
    };

    await expectNotFound(service.execute('op-2', actor));
  });

  it('usuário inexistente → USER_NOT_FOUND', async () => {
    withRepo(null);
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'a@x',
      role: UserRole.ADMIN,
    };

    await expectNotFound(service.execute('ghost', actor));
  });
});
