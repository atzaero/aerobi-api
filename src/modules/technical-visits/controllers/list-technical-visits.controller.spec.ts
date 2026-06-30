import { TechnicalVisitsPaginatedResponseDTO } from '../dtos/technical-visits-paginated-response.dto';
import type { ListTechnicalVisitsService } from '../services/list-technical-visits.service';

import { ListTechnicalVisitsController } from './list-technical-visits.controller';

describe('ListTechnicalVisitsController', () => {
  let controller: ListTechnicalVisitsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListTechnicalVisitsController({
      execute,
    } as unknown as ListTechnicalVisitsService);
  });

  it('delega', async () => {
    const q = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
    };
    const p = new TechnicalVisitsPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q);
  });
});
