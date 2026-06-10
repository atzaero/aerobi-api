import type { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';
import type { ListMovementsService } from '../services/list-movements.service';

import { ListMovementsCanonicalController } from './list-movements-canonical.controller';

describe('ListMovementsCanonicalController', () => {
  it('delega ao ListMovementsService com a query', async () => {
    const expected = {} as MovementsPaginatedResponseDTO;
    const execute = jest.fn().mockResolvedValue(expected);
    const service = { execute } as unknown as ListMovementsService;
    const controller = new ListMovementsCanonicalController(service);

    const query = { registration: 'PR-ZTT' };
    const res = await controller.handle(query);

    expect(execute).toHaveBeenCalledWith(query);
    expect(res).toBe(expected);
  });
});
