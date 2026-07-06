import { MaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import type { FindMaintenanceByIdService } from '../services/find-maintenance-by-id.service';

import { FindMaintenanceByIdController } from './find-maintenance-by-id.controller';

describe('FindMaintenanceByIdController', () => {
  let controller: FindMaintenanceByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindMaintenanceByIdController({
      execute,
    } as unknown as FindMaintenanceByIdService);
  });

  it('delega ao service.execute com id do path', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const row = new MaintenanceResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle({ id })).resolves.toBe(row);

    expect(execute).toHaveBeenCalledWith(id);
  });
});
