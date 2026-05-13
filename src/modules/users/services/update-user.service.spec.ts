import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { IUserRepository } from '../repositories/user.repository.interface';

import { UpdateUserService } from './update-user.service';

function buildUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    email: 'u@x',
    name: 'Old',
    phone: null,
    password: 'hashed',
    role: UserRole.OPERATOR,
    emailVerified: true,
    timezone: null,
    lastLoginAt: null,
    invitedById: null,
    invitedAt: null,
    acceptedInviteAt: new Date(),
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date(),
    createdBy: null,
    updatedAt: new Date(),
    updatedBy: null,
    ...overrides,
  };
}

describe('UpdateUserService', () => {
  let service: UpdateUserService;
  let findActiveById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    update = jest.fn();

    const userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findActiveById,
      existsByEmail: jest.fn(),
      create: jest.fn(),
      update,
      softDelete: jest.fn(),
      findManyPaginated: jest.fn(),
    } as unknown as IUserRepository;

    service = new UpdateUserService(userRepository, new ErrorMessageService());
  });

  it('self pode atualizar nome + telefone (sem mudar role)', async () => {
    findActiveById.mockResolvedValue(buildUser());
    update.mockResolvedValue(buildUser({ name: 'Novo' }));

    const result = await service.execute(
      'user-1',
      { name: 'Novo' },
      { id: 'user-1', email: 'u@x', role: UserRole.OPERATOR },
    );

    expect(update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ name: 'Novo', updatedBy: 'user-1' }),
    );
    expect(result.name).toBe('Novo');
  });

  it('não-ADMIN tentando mudar role → ROLE_CHANGE_FORBIDDEN', async () => {
    findActiveById.mockResolvedValue(buildUser());

    try {
      await service.execute(
        'user-1',
        { role: UserRole.ADMIN },
        { id: 'user-1', email: 'u@x', role: UserRole.OPERATOR },
      );
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.ROLE_CHANGE_FORBIDDEN,
      );
    }
  });

  it('ADMIN pode mudar role de qualquer user', async () => {
    findActiveById.mockResolvedValue(buildUser());
    update.mockResolvedValue(buildUser({ role: UserRole.COORDINATOR }));

    const result = await service.execute(
      'user-1',
      { role: UserRole.COORDINATOR },
      { id: 'admin-1', email: 'a@x', role: UserRole.ADMIN },
    );

    expect(update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ role: UserRole.COORDINATOR }),
    );
    expect(result.role).toBe(UserRole.COORDINATOR);
  });

  it('user inexistente → USER_NOT_FOUND', async () => {
    findActiveById.mockResolvedValue(null);

    try {
      await service.execute(
        'user-1',
        { name: 'X' },
        { id: 'admin-1', email: 'a@x', role: UserRole.ADMIN },
      );
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.USER_NOT_FOUND,
      );
    }
  });

  it('não-ADMIN tentando atualizar outro user → OWNERSHIP_VIOLATION', async () => {
    try {
      await service.execute(
        'user-2',
        { name: 'X' },
        { id: 'user-1', email: 'u@x', role: UserRole.OPERATOR },
      );
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.OWNERSHIP_VIOLATION,
      );
    }
  });
});
