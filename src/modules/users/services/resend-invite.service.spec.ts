import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { Uf, UserRole } from '@/generated/prisma/client';
import { InviteTokenService } from '@/modules/tokens/services/invite-token.service';

import type { UserRepository } from '../repositories/user.repository';
import {
  buildPendingUserFixture,
  buildUserFixture,
} from '../testing/user.fixtures';

import { ResendInviteService } from './resend-invite.service';

/** Registro do COORDINATOR ator com grupo provisionado (group-a / SP). */
const COORD_RECORD = buildUserFixture({
  id: 'coord-1',
  role: UserRole.COORDINATOR,
  aerodromeGroupId: 'group-a',
  state: Uf.SP,
});

describe('ResendInviteService', () => {
  let service: ResendInviteService;

  let findActiveById: jest.Mock;
  let createInviteToken: jest.Mock;
  let emit: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    createInviteToken = jest.fn();
    emit = jest.fn();

    const userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findActiveById,
      existsByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findManyPaginated: jest.fn(),
    } as unknown as UserRepository;

    const inviteTokenService = {
      createInviteToken,
    } as unknown as InviteTokenService;

    const eventEmitter = { emit } as unknown as EventEmitter2;

    service = new ResendInviteService(
      userRepository,
      inviteTokenService,
      eventEmitter,
      new ErrorMessageService(),
    );
  });

  /** Roteia `findActiveById` por id: ator vs alvo (`user-1`). */
  function routeFindActiveById(
    actorRecord: ReturnType<typeof buildUserFixture> | null,
    targetRecord: ReturnType<typeof buildPendingUserFixture> | null,
  ): void {
    findActiveById.mockImplementation((id: string) =>
      Promise.resolve(id === 'user-1' ? targetRecord : actorRecord),
    );
  }

  it('ADMIN reemite Token INVITE + dispara user.invited', async () => {
    routeFindActiveById(null, buildPendingUserFixture());
    createInviteToken.mockResolvedValue({
      token: 'new-plain-invite',
      tokenRecord: {
        id: 't-2',
        expiresAt: new Date(Date.now() + 72 * 3600_000),
      },
    });

    const result = await service.execute({
      userId: 'user-1',
      actorId: 'admin-1',
      actorRole: UserRole.ADMIN,
      actorName: 'Admin',
    });

    expect(findActiveById).toHaveBeenCalledWith('user-1');
    expect(createInviteToken).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        role: UserRole.OPERATOR,
        invitedByName: 'Admin',
      }),
    );
    expect(emit).toHaveBeenCalledTimes(1);
    const emitCalls = emit.mock.calls as Array<[string, unknown]>;
    expect(emitCalls[0][0]).toBe('user.invited');
    expect(result.id).toBe('user-1');
  });

  it('ADMIN: user inexistente → USER_NOT_FOUND', async () => {
    routeFindActiveById(null, null);

    try {
      await service.execute({
        userId: 'user-1',
        actorId: 'admin-1',
        actorRole: UserRole.ADMIN,
      });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.USER_NOT_FOUND,
      );
    }
  });

  it('ADMIN: convite já aceito → INVITE_ALREADY_ACCEPTED', async () => {
    routeFindActiveById(
      null,
      buildPendingUserFixture({ acceptedInviteAt: new Date() }),
    );

    try {
      await service.execute({
        userId: 'user-1',
        actorId: 'admin-1',
        actorRole: UserRole.ADMIN,
      });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVITE_ALREADY_ACCEPTED,
      );
    }
    expect(createInviteToken).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  describe('escopo por grupo (COORDINATOR)', () => {
    it.each([UserRole.OPERATOR, UserRole.TECHNICAL])(
      'reenvia a %s do próprio grupo → permitido',
      async (targetRole) => {
        routeFindActiveById(
          COORD_RECORD,
          buildPendingUserFixture({
            role: targetRole,
            aerodromeGroupId: 'group-a',
          }),
        );
        createInviteToken.mockResolvedValue({
          token: 'new-plain-invite',
          tokenRecord: {
            id: 't-2',
            expiresAt: new Date(Date.now() + 3600_000),
          },
        });

        await expect(
          service.execute({
            userId: 'user-1',
            actorId: 'coord-1',
            actorRole: UserRole.COORDINATOR,
          }),
        ).resolves.toMatchObject({ id: 'user-1' });
        expect(emit).toHaveBeenCalledTimes(1);
      },
    );

    it.each([UserRole.ADMIN, UserRole.COORDINATOR])(
      'reenvia a %s (não gerível) → USER_NOT_FOUND (não vaza)',
      async (targetRole) => {
        routeFindActiveById(
          COORD_RECORD,
          buildPendingUserFixture({
            role: targetRole,
            aerodromeGroupId: 'group-a',
          }),
        );

        try {
          await service.execute({
            userId: 'user-1',
            actorId: 'coord-1',
            actorRole: UserRole.COORDINATOR,
          });
          fail('should have thrown');
        } catch (e) {
          expect((e as CustomHttpException).getErrorCode()).toBe(
            ErrorCode.USER_NOT_FOUND,
          );
        }
        expect(createInviteToken).not.toHaveBeenCalled();
        expect(emit).not.toHaveBeenCalled();
      },
    );

    it('reenvia a OPERATOR de outro grupo → USER_NOT_FOUND', async () => {
      routeFindActiveById(
        COORD_RECORD,
        buildPendingUserFixture({
          role: UserRole.OPERATOR,
          aerodromeGroupId: 'group-b',
        }),
      );

      try {
        await service.execute({
          userId: 'user-1',
          actorId: 'coord-1',
          actorRole: UserRole.COORDINATOR,
        });
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.USER_NOT_FOUND,
        );
      }
    });

    it('COORDINATOR sem grupo provisionado → FORBIDDEN', async () => {
      routeFindActiveById(
        buildUserFixture({
          id: 'coord-1',
          role: UserRole.COORDINATOR,
          aerodromeGroupId: null,
          state: null,
        }),
        buildPendingUserFixture({ role: UserRole.OPERATOR }),
      );

      try {
        await service.execute({
          userId: 'user-1',
          actorId: 'coord-1',
          actorRole: UserRole.COORDINATOR,
        });
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.FORBIDDEN,
        );
      }
      expect(createInviteToken).not.toHaveBeenCalled();
    });

    it('COORDINATOR inativo/soft-deletado (registro null) → 401 ACCOUNT_DELETED', async () => {
      routeFindActiveById(
        null,
        buildPendingUserFixture({ role: UserRole.OPERATOR }),
      );

      try {
        await service.execute({
          userId: 'user-1',
          actorId: 'coord-1',
          actorRole: UserRole.COORDINATOR,
        });
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.ACCOUNT_DELETED,
        );
        expect((e as CustomHttpException).getStatus()).toBe(401);
      }
      expect(createInviteToken).not.toHaveBeenCalled();
    });
  });
});
