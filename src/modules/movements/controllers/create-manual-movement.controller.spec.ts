import { UserRole } from '@/generated/prisma/client';
import { MovementSource, MovementType } from '@/generated/prisma/enums';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { CreateManualMovementDTO } from '../dtos/create-manual-movement.dto';
import type { CreateMovementService } from '../services/create-movement.service';
import type { MovementScopeService } from '../services/movement-scope.service';

import { CreateManualMovementController } from './create-manual-movement.controller';

const actor: AuthenticatedUser = {
  id: 'user-7',
  email: 'a@e',
  role: UserRole.COORDINATOR,
};

describe('CreateManualMovementController', () => {
  let controller: CreateManualMovementController;
  let execute: jest.Mock;
  let assertIcaoInScope: jest.Mock;

  const baseDto: CreateManualMovementDTO = {
    registration: 'PR-ABC',
    reading_datetime: new Date('2026-06-08T16:52:39Z'),
    aerodrome: 'SBSP',
    operationType: MovementType.TAKEOFF,
  };

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue({
      id: 'm-1',
      message: 'Reading registered successfully',
      image_path: null,
    });
    assertIcaoInScope = jest.fn().mockResolvedValue(undefined);
    const service = { execute } as unknown as CreateMovementService;
    const scopeService = {
      assertIcaoInScope,
    } as unknown as MovementScopeService;
    controller = new CreateManualMovementController(service, scopeService);
  });

  it('valida o escopo do ICAO e delega com origem MANUAL + createdBy do ator', async () => {
    const res = await controller.handle(baseDto, actor);

    expect(assertIcaoInScope).toHaveBeenCalledWith('SBSP', actor);
    expect(res.id).toBe('m-1');
    expect(execute).toHaveBeenCalledWith(
      baseDto,
      {
        source: MovementSource.MANUAL,
        createdBy: 'user-7',
        operationType: MovementType.TAKEOFF,
      },
      undefined,
    );
  });

  it('repassa a imagem ao service', async () => {
    const image = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('img'),
    } as Express.Multer.File;

    await controller.handle(baseDto, actor, image);

    expect(execute).toHaveBeenCalledWith(
      baseDto,
      {
        source: MovementSource.MANUAL,
        createdBy: 'user-7',
        operationType: MovementType.TAKEOFF,
      },
      image,
    );
  });
});
