import { LandingRequestsPaginatedResponseDTO } from '../dtos/landing-requests-paginated-response.dto';
import type { ListLandingRequestsService } from '../services/list-landing-requests.service';

import { ListLandingRequestsController } from './list-landing-requests.controller';

describe('ListLandingRequestsController', () => {
  let controller: ListLandingRequestsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListLandingRequestsController({
      execute,
    } as unknown as ListLandingRequestsService);
  });

  it('delega query ao service', async () => {
    const q = { page: 1, limit: 5 };
    const paginated = new LandingRequestsPaginatedResponseDTO([], 1, 5, 0);
    execute.mockResolvedValue(paginated);
    await expect(controller.handle(q)).resolves.toBe(paginated);
    expect(execute).toHaveBeenCalledWith(q);
  });
});
