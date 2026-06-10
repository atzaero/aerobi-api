import type { MovementResponseDTO } from '../dtos/movement-response.dto';
import type { RemoveMovementService } from '../services/remove-movement.service';

import { RemoveMovementCanonicalController } from './remove-movement-canonical.controller';

describe('RemoveMovementCanonicalController', () => {
  it('delega ao RemoveMovementService com id e deletedBy', async () => {
    const expected = { id: 'm-1' } as MovementResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as RemoveMovementService;
    const controller = new RemoveMovementCanonicalController(service);

    const res = await controller.handle({ movementId: 'm-1' });

    expect(execute).toHaveBeenCalledWith({ id: 'm-1', deletedBy: 'system' });
    expect(res).toBe(expected);
  });
});
