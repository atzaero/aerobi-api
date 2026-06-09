import { ErrorCode } from '@/common/enums/error-code.enum';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import type { UsersPaginatedResponseDto } from '../dtos/users-paginated-response.dto';
import type { ListUsersService } from '../services/list-users.service';
import {
  readRequiredPermission,
  runPermissionsGuard,
} from '../testing/permissions-guard.harness';

import { ListUsersController } from './list-users.controller';

describe('ListUsersController', () => {
  let controller: ListUsersController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListUsersController({
      execute,
    } as unknown as ListUsersService);
  });

  it('repassa a query ao service e devolve o resultado paginado', async () => {
    const query: ListUsersQueryDto = {
      page: 1,
      limit: 10,
      role: UserRole.OPERATOR,
    };
    const page = {
      data: [],
      meta: { totalItems: 0 },
    } as unknown as UsersPaginatedResponseDto;
    execute.mockResolvedValue(page);

    await expect(controller.handle(query)).resolves.toBe(page);
    expect(execute).toHaveBeenCalledWith(query);
  });

  describe('autorização (@RequirePermission user:list)', () => {
    it('declara a permissão user:list', () => {
      expect(readRequiredPermission(ListUsersController, 'handle')).toEqual({
        subject: 'user',
        action: 'list',
      });
    });

    it.each([UserRole.ADMIN, UserRole.COORDINATOR])(
      'autoriza %s (2xx)',
      (role) => {
        expect(runPermissionsGuard(ListUsersController, 'handle', role)).toBe(
          true,
        );
      },
    );

    it.each([UserRole.OPERATOR, UserRole.TECHNICAL])(
      'nega %s (403 FORBIDDEN)',
      (role) => {
        try {
          runPermissionsGuard(ListUsersController, 'handle', role);
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
