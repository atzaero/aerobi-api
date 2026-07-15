import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserRepository } from '../repositories/user.repository';
import { buildUserFixture } from '../testing/user.fixtures';

import { UpdateProfileService } from './update-profile.service';

const ACTOR: AuthenticatedUser = {
  id: 'user-1',
  email: 'u@x',
  role: UserRole.OPERATOR,
};

describe('UpdateProfileService (auto-edição)', () => {
  let service: UpdateProfileService;
  let findActiveById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    update = jest.fn();
    const userRepository = {
      findActiveById,
      update,
    } as unknown as UserRepository;
    service = new UpdateProfileService(
      userRepository,
      new ErrorMessageService(),
    );
  });

  it('edita name/phone/timezone do próprio usuário', async () => {
    findActiveById.mockResolvedValue(buildUserFixture({ id: 'user-1' }));
    update.mockResolvedValue(
      buildUserFixture({ id: 'user-1', name: 'Novo', phone: '+5511999999999' }),
    );

    await service.execute(ACTOR, {
      name: 'Novo',
      phone: '+5511999999999',
      timezone: 'America/Sao_Paulo',
    });

    expect(update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        name: 'Novo',
        phone: '+5511999999999',
        timezone: 'America/Sao_Paulo',
        updatedBy: 'user-1',
      }),
    );
  });

  it('conta soft-deletada (token válido) → ACCOUNT_DELETED', async () => {
    findActiveById.mockResolvedValue(null);

    const p = service.execute(ACTOR, { name: 'X' });
    await expect(p).rejects.toBeInstanceOf(CustomHttpException);
    await p.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.ACCOUNT_DELETED,
      ),
    );
  });
});
