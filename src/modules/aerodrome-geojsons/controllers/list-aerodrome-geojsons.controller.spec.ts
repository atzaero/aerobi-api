import { AerodromeGeojsonsPaginatedResponseDTO } from '../dtos/aerodrome-geojsons-paginated-response.dto';
import type { ListAerodromeGeojsonsService } from '../services/list-aerodrome-geojsons.service';

import { ListAerodromeGeojsonsController } from './list-aerodrome-geojsons.controller';

describe('ListAerodromeGeojsonsController', () => {
  let controller: ListAerodromeGeojsonsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListAerodromeGeojsonsController({
      execute,
    } as unknown as ListAerodromeGeojsonsService);
  });

  it('delega', async () => {
    const q = { limit: 25 };
    const p = new AerodromeGeojsonsPaginatedResponseDTO([], 1, 25, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q);
  });
});
