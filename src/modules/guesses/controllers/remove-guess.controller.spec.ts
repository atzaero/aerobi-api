import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { GuessParamDTO } from '../dtos/guess-param.dto';
import type { RemoveGuessService } from '../services/remove-guess.service';

import { RemoveGuessController } from './remove-guess.controller';

describe('RemoveGuessController', () => {
  let controller: RemoveGuessController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveGuessController({
      execute,
    } as unknown as RemoveGuessService);
  });

  it('delega id/ator e monta o contexto de auditoria do ator', async () => {
    const params: GuessParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = { id: params.id, maintenanceId: 'm1' };
    execute.mockResolvedValue(row);

    await expect(controller.handle(params, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      params.id,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
