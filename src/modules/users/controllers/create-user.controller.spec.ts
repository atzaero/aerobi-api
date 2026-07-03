import type { Request } from 'express';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import type { CreateUserService } from '../services/create-user.service';
import {
  readRequiredPermission,
  runPermissionsGuard,
} from '../testing/permissions-guard.harness';

import { CreateUserController } from './create-user.controller';

describe('CreateUserController', () => {
  let controller: CreateUserController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateUserController({
      execute,
    } as unknown as CreateUserService);
  });

  it('delega o body + actorId/actorRole do CurrentUser para o service', async () => {
    const dto: CreateUserRequestDto = {
      email: 'piloto@aerobi.local',
      name: 'Piloto',
      role: UserRole.OPERATOR,
    };
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@aerobi.local',
      role: UserRole.ADMIN,
    };
    const persisted = { id: 'new-id', email: dto.email } as UserResponseDto;
    execute.mockResolvedValue(persisted);
    const request = {
      headers: { 'user-agent': 'jest-ua' },
      ip: '9.9.9.9',
    } as unknown as Request;

    await expect(controller.handle(dto, actor, request)).resolves.toBe(
      persisted,
    );
    expect(execute).toHaveBeenCalledWith(
      { ...dto, actorId: 'admin-1', actorRole: UserRole.ADMIN },
      expect.objectContaining({
        actorId: 'admin-1',
        ipAddress: '9.9.9.9',
        userAgent: 'jest-ua',
      }),
    );
  });

  describe('autorização (@RequirePermission user:create)', () => {
    it('declara a permissão user:create', () => {
      expect(readRequiredPermission(CreateUserController, 'handle')).toEqual({
        subject: 'user',
        action: 'create',
      });
    });

    it.each([UserRole.ADMIN, UserRole.COORDINATOR])(
      'autoriza %s (2xx)',
      (role) => {
        expect(runPermissionsGuard(CreateUserController, 'handle', role)).toBe(
          true,
        );
      },
    );

    it.each([UserRole.OPERATOR, UserRole.TECHNICAL])(
      'nega %s (403 FORBIDDEN)',
      (role) => {
        try {
          runPermissionsGuard(CreateUserController, 'handle', role);
          fail('should have thrown');
        } catch (e) {
          expect((e as CustomHttpException).getErrorCode()).toBe(
            ErrorCode.FORBIDDEN,
          );
        }
      },
    );
  });
});
