import { ConformityStatus } from '@/generated/prisma/enums';

import type { MovementConformityResolvedEvent } from '../events/movement-conformity-resolved.event';
import type { MovementRepository } from '../repositories/movement.repository';

import { MovementConformityListener } from './movement-conformity.listener';

describe('MovementConformityListener', () => {
  let listener: MovementConformityListener;
  let updateConformityStatus: jest.Mock;

  const event: MovementConformityResolvedEvent = {
    movementId: 'mov-1',
    status: ConformityStatus.CONFORMANT,
  };

  beforeEach(() => {
    updateConformityStatus = jest.fn().mockResolvedValue(undefined);
    const repo = {
      updateConformityStatus,
    } as unknown as MovementRepository;
    listener = new MovementConformityListener(repo);
  });

  it('persiste o status resolvido no repositório', async () => {
    await listener.handleConformityResolved(event);

    expect(updateConformityStatus).toHaveBeenCalledWith(
      'mov-1',
      ConformityStatus.CONFORMANT,
    );
  });

  it('captura erro do repositório e não relança', async () => {
    const error = jest
      .spyOn(listener['logger'], 'error')
      .mockImplementation(() => undefined);
    updateConformityStatus.mockRejectedValue(new Error('db down'));

    await expect(
      listener.handleConformityResolved(event),
    ).resolves.toBeUndefined();
    expect(error).toHaveBeenCalled();
  });
});
