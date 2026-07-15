import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { User } from '@/generated/prisma/client';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { EventEmitter2 } from '@nestjs/event-emitter';

import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserRepository } from '../repositories/user.repository';
import { buildUserFixture } from '../testing/user.fixtures';
import { USER_EMAIL_CHANGED_EVENT } from '../events/user-email-changed.event';

import { UpdateUserService } from './update-user.service';

const ADMIN: AuthenticatedUser = {
  id: 'admin-1',
  email: 'admin@x',
  role: UserRole.ADMIN,
};
const COORD: AuthenticatedUser = {
  id: 'coord-1',
  email: 'coord@x',
  role: UserRole.COORDINATOR,
};

/** Registro do coordenador ator (grupo g1), retornado pelo resolveActorGroupScope. */
const coordRecord = buildUserFixture({
  id: 'coord-1',
  role: UserRole.COORDINATOR,
  groupId: 'g1',
});

describe('UpdateUserService (edição administrativa)', () => {
  let service: UpdateUserService;
  let findActiveById: jest.Mock;
  let existsByEmail: jest.Mock;
  let update: jest.Mock;
  let revokeAllForUser: jest.Mock;
  let emit: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    existsByEmail = jest.fn().mockResolvedValue(false);
    update = jest.fn();
    revokeAllForUser = jest.fn().mockResolvedValue(2);
    emit = jest.fn();
    record = jest.fn();

    const userRepository = {
      findActiveById,
      existsByEmail,
      update,
    } as unknown as UserRepository;
    const refreshTokenRepository = {
      revokeAllForUser,
    } as unknown as RefreshTokenRepository;
    const eventEmitter = { emit } as unknown as EventEmitter2;

    service = new UpdateUserService(
      userRepository,
      refreshTokenRepository,
      eventEmitter,
      new ErrorMessageService(),
      { record } as unknown as AuditRecorderService,
    );
  });

  /** Resolve o ator (coord) e o alvo conforme o id consultado. */
  function withRepo(target: User | null, actorRecord: User = coordRecord) {
    findActiveById.mockImplementation((uid: string) => {
      if (uid === actorRecord.id) return actorRecord;
      if (target && uid === target.id) return target;
      return null;
    });
  }

  async function expectErrorCode(
    promise: Promise<unknown>,
    code: ErrorCode,
  ): Promise<void> {
    await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
    await promise.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(code),
    );
  }

  it('ADMIN edita name de qualquer user (sem revogar sessões)', async () => {
    const target = buildUserFixture({ id: 'u-1', name: 'Old' });
    withRepo(target);
    update.mockResolvedValue(buildUserFixture({ id: 'u-1', name: 'Novo' }));

    const result = await service.execute('u-1', { name: 'Novo' }, ADMIN);

    expect(update).toHaveBeenCalledWith(
      'u-1',
      expect.objectContaining({ name: 'Novo', updatedBy: 'admin-1' }),
    );
    expect(revokeAllForUser).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(result.name).toBe('Novo');
  });

  it('grava auditoria UPDATE com before/after e metadata de mudanças', async () => {
    const target = buildUserFixture({
      id: 'u-1',
      name: 'Old',
      role: UserRole.OPERATOR,
    });
    withRepo(target);
    update.mockResolvedValue(
      buildUserFixture({ id: 'u-1', name: 'Novo', role: UserRole.OPERATOR }),
    );

    await service.execute('u-1', { name: 'Novo' }, ADMIN);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.UPDATE,
        entityType: 'user',
        entityId: 'u-1',
        metadata: { emailChanged: false, roleChanged: false },
      }),
      expect.any(Object),
    );
    const [firstCall] = record.mock.calls as Array<
      [{ before: { name: string }; after: { name: string } }, unknown]
    >;
    expect(firstCall[0].before.name).toBe('Old');
    expect(firstCall[0].after.name).toBe('Novo');
  });

  it('ADMIN troca email → valida unicidade, revoga sessões e emite evento', async () => {
    const target = buildUserFixture({ id: 'u-1', email: 'old@x' });
    withRepo(target);
    update.mockResolvedValue(
      buildUserFixture({ id: 'u-1', email: 'new@x', name: 'User' }),
    );

    await service.execute('u-1', { email: 'new@x' }, ADMIN);

    expect(existsByEmail).toHaveBeenCalledWith('new@x');
    expect(update).toHaveBeenCalledWith(
      'u-1',
      expect.objectContaining({ email: 'new@x' }),
    );
    expect(revokeAllForUser).toHaveBeenCalledWith('u-1');
    expect(emit).toHaveBeenCalledWith(
      USER_EMAIL_CHANGED_EVENT,
      expect.objectContaining({ oldEmail: 'old@x', newEmail: 'new@x' }),
    );
  });

  it('email já em uso → EMAIL_ALREADY_REGISTERED', async () => {
    withRepo(buildUserFixture({ id: 'u-1', email: 'old@x' }));
    existsByEmail.mockResolvedValue(true);

    await expectErrorCode(
      service.execute('u-1', { email: 'taken@x' }, ADMIN),
      ErrorCode.EMAIL_ALREADY_REGISTERED,
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('corrida de unicidade no update (P2002) → EMAIL_ALREADY_REGISTERED', async () => {
    withRepo(buildUserFixture({ id: 'u-1', email: 'old@x' }));
    existsByEmail.mockResolvedValue(false); // passou a checagem prévia
    update.mockRejectedValue({ code: 'P2002' });

    await expectErrorCode(
      service.execute('u-1', { email: 'race@x' }, ADMIN),
      ErrorCode.EMAIL_ALREADY_REGISTERED,
    );
  });

  it('COORDINATOR edita operator do próprio grupo', async () => {
    const target = buildUserFixture({
      id: 'op-1',
      role: UserRole.OPERATOR,
      groupId: 'g1',
    });
    withRepo(target);
    update.mockResolvedValue(buildUserFixture({ id: 'op-1', name: 'Novo' }));

    await service.execute('op-1', { name: 'Novo' }, COORD);

    expect(update).toHaveBeenCalledWith(
      'op-1',
      expect.objectContaining({ name: 'Novo', updatedBy: 'coord-1' }),
    );
  });

  it('COORDINATOR não edita alvo de outro grupo → USER_NOT_FOUND', async () => {
    withRepo(
      buildUserFixture({
        id: 'op-2',
        role: UserRole.OPERATOR,
        groupId: 'g2',
      }),
    );

    await expectErrorCode(
      service.execute('op-2', { name: 'X' }, COORD),
      ErrorCode.USER_NOT_FOUND,
    );
  });

  it('COORDINATOR não edita ADMIN → USER_NOT_FOUND', async () => {
    withRepo(
      buildUserFixture({ id: 'a-9', role: UserRole.ADMIN, groupId: null }),
    );

    await expectErrorCode(
      service.execute('a-9', { name: 'X' }, COORD),
      ErrorCode.USER_NOT_FOUND,
    );
  });

  it('COORDINATOR não promove alvo a ADMIN → ROLE_CHANGE_FORBIDDEN', async () => {
    withRepo(
      buildUserFixture({
        id: 'op-1',
        role: UserRole.OPERATOR,
        groupId: 'g1',
      }),
    );

    await expectErrorCode(
      service.execute('op-1', { role: UserRole.ADMIN }, COORD),
      ErrorCode.ROLE_CHANGE_FORBIDDEN,
    );
  });

  it('user inexistente → USER_NOT_FOUND', async () => {
    withRepo(null);

    await expectErrorCode(
      service.execute('ghost', { name: 'X' }, ADMIN),
      ErrorCode.USER_NOT_FOUND,
    );
  });

  it('COORDINATOR sem grupo provisionado → FORBIDDEN', async () => {
    const coordSemGrupo = buildUserFixture({
      id: 'coord-1',
      role: UserRole.COORDINATOR,
      groupId: null,
    });
    withRepo(
      buildUserFixture({ id: 'op-1', role: UserRole.OPERATOR, groupId: 'g1' }),
      coordSemGrupo,
    );

    await expectErrorCode(
      service.execute('op-1', { name: 'X' }, COORD),
      ErrorCode.FORBIDDEN,
    );
  });
});
