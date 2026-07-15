import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { GuessParamDTO } from '../dtos/guess-param.dto';
import type { UpdateGuessStatusDTO } from '../dtos/update-guess-status.dto';
import type { UpdateGuessStatusService } from '../services/update-guess-status.service';

import { UpdateGuessStatusController } from './update-guess-status.controller';

describe('UpdateGuessStatusController', () => {
  let controller: UpdateGuessStatusController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'coord-1',
    email: 'coord@test.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateGuessStatusController({
      execute,
    } as unknown as UpdateGuessStatusService);
  });

  it('delega id/dto/ator e monta o contexto de auditoria do ator', async () => {
    const params: GuessParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const dto: UpdateGuessStatusDTO = { status: 'considered' };
    const request = buildMockRequest({ ip: '1.2.3.4', userAgent: 'jest' });
    const row = { id: params.id, status: 'considered', maintenanceId: 'm1' };
    execute.mockResolvedValue(row);

    await expect(controller.handle(params, dto, actor, request)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith(
      params.id,
      dto,
      actor,
      expect.objectContaining({
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        userAgent: 'jest',
      }),
    );
  });
});
