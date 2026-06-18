import type { MovementResponseDTO } from '../dtos/movement-response.dto';
import type { UpdateMovementService } from '../services/update-movement.service';

import { UpdateMovementCanonicalController } from './update-movement-canonical.controller';

describe('UpdateMovementCanonicalController', () => {
  it('delega ao UpdateMovementService com id, registration e updatedBy', async () => {
    const expected = { id: 'm-1' } as MovementResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as UpdateMovementService;
    const controller = new UpdateMovementCanonicalController(service);

    const res = await controller.handle(
      { movementId: 'm-1' },
      { registration: 'PR-ZTT' },
    );

    expect(execute).toHaveBeenCalledWith({
      id: 'm-1',
      registration: 'PR-ZTT',
      updatedBy: 'system',
    });
    expect(res).toBe(expected);
  });
});
