import { PilotLandingsPaginatedResponseDTO } from '../dtos/pilot-landings-paginated-response.dto';
import type { ListPilotLandingsService } from '../services/list-pilot-landings.service';

import { ListPilotLandingsController } from './list-pilot-landings.controller';

describe('ListPilotLandingsController', () => {
  let controller: ListPilotLandingsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListPilotLandingsController({
      execute,
    } as unknown as ListPilotLandingsService);
  });

  it('delega GET lista ao service com query', async () => {
    const query = {
      page: 1,
      limit: 20,
      operationalAerodromeId: '22222222-2222-4222-8222-222222222222',
    };
    const paginated = new PilotLandingsPaginatedResponseDTO([], 1, 20, 0);
    execute.mockResolvedValue(paginated);

    await expect(controller.handle(query)).resolves.toBe(paginated);
    expect(execute).toHaveBeenCalledWith(query);
  });
});
