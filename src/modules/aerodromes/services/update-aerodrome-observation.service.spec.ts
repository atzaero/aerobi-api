import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { UpdateAerodromeObservationService } from './update-aerodrome-observation.service';

describe('UpdateAerodromeObservationService', () => {
  let service: UpdateAerodromeObservationService;
  let findById: jest.Mock;
  let update: jest.Mock;

  const id = '11111111-1111-4111-8111-111111111111';
  const actor: AuthenticatedUser = {
    id: 'op1',
    email: 'o@x',
    role: UserRole.OPERATOR,
  };

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as AerodromeRepository;
    service = new UpdateAerodromeObservationService(
      repo,
      new ErrorMessageService(),
    );
  });

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id, { observation: 'x' }, actor);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('grava a observação com ator real', async () => {
    findById.mockResolvedValue(buildAerodromeWithGroupFixture({ id }));
    update.mockResolvedValue(
      buildAerodromeWithGroupFixture({ id, observation: 'Atenção' }),
    );
    await service.execute(id, { observation: 'Atenção' }, actor);
    expect(update).toHaveBeenCalledWith(id, {
      observation: 'Atenção',
      updatedBy: actor.id,
    });
  });

  it('observação vazia/ausente limpa o campo (null)', async () => {
    findById.mockResolvedValue(buildAerodromeWithGroupFixture({ id }));
    update.mockResolvedValue(buildAerodromeWithGroupFixture({ id }));
    await service.execute(id, {}, actor);
    expect(update).toHaveBeenCalledWith(id, {
      observation: null,
      updatedBy: actor.id,
    });
  });
});
