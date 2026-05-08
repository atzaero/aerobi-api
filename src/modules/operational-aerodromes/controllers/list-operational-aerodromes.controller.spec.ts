import { OperationalAerodromesPaginatedResponseDTO } from '../dtos/operational-aerodromes-paginated-response.dto';
import type { ListOperationalAerodromesService } from '../services/list-operational-aerodromes.service';

import { ListOperationalAerodromesController } from './list-operational-aerodromes.controller';

describe('ListOperationalAerodromesController', () => {
  let controller: ListOperationalAerodromesController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListOperationalAerodromesController({
      execute,
    } as unknown as ListOperationalAerodromesService);
  });

  it('delega query', async () => {
    const q = { groupId: '44444444-4444-4444-8444-444444444444', icao: 'sb' };
    const p = new OperationalAerodromesPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q);
  });
});
