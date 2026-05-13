import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import { InviteTokenService } from '@/modules/tokens/services/invite-token.service';

import type { UserRepository } from '../repositories/user.repository';

import { ResendInviteService } from './resend-invite.service';

function buildPendingUser() {
  return {
    id: 'user-1',
    email: 'piloto@aerobi.local',
    name: 'Piloto',
    phone: null,
    password: null,
    role: UserRole.OPERATOR,
    emailVerified: false,
    timezone: null,
    lastLoginAt: null,
    invitedById: 'admin-1',
    invitedAt: new Date('2026-05-01T00:00:00Z'),
    acceptedInviteAt: null,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date(),
    createdBy: null,
    updatedAt: new Date(),
    updatedBy: null,
  };
}

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
    findActiveById.mockResolvedValue(buildPendingUser());
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
      await service.execute({ userId: 'ghost', actorId: 'admin-1' });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.USER_NOT_FOUND,
      );
    }
  });

  it('convite já aceito → INVITE_ALREADY_ACCEPTED', async () => {
    findActiveById.mockResolvedValue({
      ...buildPendingUser(),
      acceptedInviteAt: new Date(),
    });

    try {
      await service.execute({ userId: 'user-1', actorId: 'admin-1' });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVITE_ALREADY_ACCEPTED,
      );
    }
    expect(createInviteToken).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
