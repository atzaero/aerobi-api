import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import type { ListAerodromeGroupsService } from '../services/list-aerodrome-groups.service';

import { ListAerodromeGroupsController } from './list-aerodrome-groups.controller';

describe('ListAerodromeGroupsController', () => {
  let controller: ListAerodromeGroupsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListAerodromeGroupsController({
      execute,
    } as unknown as ListAerodromeGroupsService);
  });

  it('delega', async () => {
    const q = { page: 1 };
    const p = new AerodromeGroupsPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q);
  });
});
