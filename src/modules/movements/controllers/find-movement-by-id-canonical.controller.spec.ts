import type { MovementResponseDTO } from '../dtos/movement-response.dto';
import type { FindMovementByIdService } from '../services/find-movement-by-id.service';

import { FindMovementByIdCanonicalController } from './find-movement-by-id-canonical.controller';

describe('FindMovementByIdCanonicalController', () => {
  it('delega ao FindMovementByIdService com o movementId', async () => {
    const expected = { id: 'm-1' } as MovementResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as FindMovementByIdService;
    const controller = new FindMovementByIdCanonicalController(service);

    const res = await controller.handle({ movementId: 'm-1' });

    expect(execute).toHaveBeenCalledWith('m-1');
    expect(res).toBe(expected);
  });
});
