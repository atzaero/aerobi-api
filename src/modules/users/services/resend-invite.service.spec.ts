import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import { InviteTokenService } from '@/modules/tokens/services/invite-token.service';

import type { UserRepository } from '../repositories/user.repository';
import { buildPendingUserFixture } from '../testing/user.fixtures';

import { ResendInviteService } from './resend-invite.service';

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

  it('reemite Token INVITE + dispara user.invited', async () => {
    findActiveById.mockResolvedValue(buildPendingUserFixture());
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

  it('user inexistente → USER_NOT_FOUND', async () => {
    findActiveById.mockResolvedValue(null);

    try {
      await service.execute({
        userId: 'ghost',
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

  it('convite já aceito → INVITE_ALREADY_ACCEPTED', async () => {
    findActiveById.mockResolvedValue({
      ...buildPendingUserFixture(),
      acceptedInviteAt: new Date(),
    });

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

  it('COORDINATOR reenvia convite de ADMIN → FORBIDDEN (sem reemitir)', async () => {
    findActiveById.mockResolvedValue(
      buildPendingUserFixture({ role: UserRole.ADMIN }),
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
    expect(emit).not.toHaveBeenCalled();
  });
});
