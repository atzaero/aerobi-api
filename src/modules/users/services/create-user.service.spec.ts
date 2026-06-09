import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import { InviteTokenService } from '@/modules/tokens/services/invite-token.service';

import type { UserRepository } from '../repositories/user.repository';
import { buildPendingUserFixture } from '../testing/user.fixtures';

import { CreateUserService } from './create-user.service';

describe('CreateUserService', () => {
  let service: CreateUserService;

  let findByEmail: jest.Mock;
  let findById: jest.Mock;
  let findActiveById: jest.Mock;
  let existsByEmail: jest.Mock;
  let create: jest.Mock;
  let update: jest.Mock;
  let softDelete: jest.Mock;
  let findManyPaginated: jest.Mock;

  let createInviteToken: jest.Mock;
  let emit: jest.Mock;

  beforeEach(() => {
    findByEmail = jest.fn();
    findById = jest.fn();
    findActiveById = jest.fn();
    existsByEmail = jest.fn();
    create = jest.fn();
    update = jest.fn();
    softDelete = jest.fn();
    findManyPaginated = jest.fn();

    createInviteToken = jest.fn();
    emit = jest.fn();

    const userRepository = {
      findByEmail,
      findById,
      findActiveById,
      existsByEmail,
      create,
      update,
      softDelete,
      findManyPaginated,
    } as unknown as UserRepository;

    const inviteTokenService = {
      createInviteToken,
    } as unknown as InviteTokenService;

    const eventEmitter = { emit } as unknown as EventEmitter2;

    service = new CreateUserService(
      userRepository,
      inviteTokenService,
      eventEmitter,
      new ErrorMessageService(),
    );
  });

  it('cria User pendente + emite Token INVITE + dispara user.invited', async () => {
    existsByEmail.mockResolvedValue(false);
    create.mockResolvedValue(buildPendingUserFixture());
    createInviteToken.mockResolvedValue({
      token: 'plain-invite',
      tokenRecord: {
        id: 't-1',
        expiresAt: new Date(Date.now() + 72 * 3600_000),
      },
    });

    // ValidationPipe normaliza email via `@NormalizeEmail()` antes do service.
    const result = await service.execute({
      email: 'piloto@aerobi.local',
      name: 'Piloto',
      role: UserRole.OPERATOR,
      actorId: 'admin-1',
      actorRole: UserRole.ADMIN,
      actorName: 'Admin Aerobi',
    });

    expect(existsByEmail).toHaveBeenCalledWith('piloto@aerobi.local');
    expect(create).toHaveBeenCalledTimes(1);
    expect(createInviteToken).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        role: UserRole.OPERATOR,
        invitedByName: 'Admin Aerobi',
      }),
    );
    expect(emit).toHaveBeenCalledTimes(1);
    const emitCalls = emit.mock.calls as Array<[string, unknown]>;
    expect(emitCalls[0][0]).toBe('user.invited');
    expect(result.id).toBe('user-1');
    expect(result.email).toBe('piloto@aerobi.local');
  });

  it('email duplicado → EMAIL_ALREADY_REGISTERED', async () => {
    existsByEmail.mockResolvedValue(true);

    try {
      await service.execute({
        email: 'jaexiste@aerobi.local',
        name: 'X',
        role: UserRole.OPERATOR,
        actorId: 'admin-1',
        actorRole: UserRole.ADMIN,
      });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.EMAIL_ALREADY_REGISTERED,
      );
    }
  });

  describe('recorte por role-alvo', () => {
    it.each([UserRole.OPERATOR, UserRole.TECHNICAL])(
      'COORDINATOR cria %s → permitido',
      async (targetRole) => {
        existsByEmail.mockResolvedValue(false);
        create.mockResolvedValue(buildPendingUserFixture({ role: targetRole }));
        createInviteToken.mockResolvedValue({
          token: 'plain-invite',
          tokenRecord: {
            id: 't-1',
            expiresAt: new Date(Date.now() + 72 * 3600_000),
          },
        });

        await expect(
          service.execute({
            email: 'novo@aerobi.local',
            name: 'Novo',
            role: targetRole,
            actorId: 'coord-1',
            actorRole: UserRole.COORDINATOR,
          }),
        ).resolves.toMatchObject({ id: 'user-1' });
      },
    );

    it.each([UserRole.ADMIN, UserRole.COORDINATOR])(
      'COORDINATOR cria %s → FORBIDDEN (sem persistir)',
      async (targetRole) => {
        try {
          await service.execute({
            email: 'novo@aerobi.local',
            name: 'Novo',
            role: targetRole,
            actorId: 'coord-1',
            actorRole: UserRole.COORDINATOR,
          });
          fail('should have thrown');
        } catch (e) {
          expect((e as CustomHttpException).getErrorCode()).toBe(
            ErrorCode.FORBIDDEN,
          );
        }
        expect(existsByEmail).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
      },
    );
  });
});
