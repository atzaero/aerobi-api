import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import type { RemoveGeojsonService } from '../services/remove-geojson.service';

import { RemoveGeojsonController } from './remove-geojson.controller';

describe('RemoveGeojsonController', () => {
  let controller: RemoveGeojsonController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'admin-1',
    email: 'a@a.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveGeojsonController({
      execute,
    } as unknown as RemoveGeojsonService);
  });

  it('delega id/ator e monta o contexto de auditoria do ator', async () => {
    const params: GeojsonParamDTO = {
      id: '88888888-8888-4888-8888-888888888888',
    };
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = new GeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      params.id,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
