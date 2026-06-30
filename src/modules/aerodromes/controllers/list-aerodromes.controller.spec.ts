import { AerodromesPaginatedResponseDTO } from '../dtos/aerodromes-paginated-response.dto';
import type { ListAerodromesService } from '../services/list-aerodromes.service';

import { ListAerodromesController } from './list-aerodromes.controller';

describe('ListAerodromesController', () => {
  let controller: ListAerodromesController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListAerodromesController({
      execute,
    } as unknown as ListAerodromesService);
  });

  it('delega query', async () => {
    const q = { groupId: '44444444-4444-4444-8444-444444444444', icao: 'sb' };
    const p = new AerodromesPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q);
  });
});
