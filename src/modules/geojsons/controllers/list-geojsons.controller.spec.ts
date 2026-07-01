import { GeojsonsPaginatedResponseDTO } from '../dtos/geojsons-paginated-response.dto';
import type { ListGeojsonsService } from '../services/list-geojsons.service';

import { ListGeojsonsController } from './list-geojsons.controller';

describe('ListGeojsonsController', () => {
  let controller: ListGeojsonsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListGeojsonsController({
      execute,
    } as unknown as ListGeojsonsService);
  });

  it('delega', async () => {
    const q = { limit: 25 };
    const p = new GeojsonsPaginatedResponseDTO([], 1, 25, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q);
  });
});
