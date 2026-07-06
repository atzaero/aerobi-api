import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { FindMaintenanceByIdService } from './find-maintenance-by-id.service';

describe('FindMaintenanceByIdService', () => {
  let service: FindMaintenanceByIdService;

  beforeEach(() => {
    const repoStub = {
      findById: jest.fn(),
    } as unknown as MaintenanceRepository;
    service = new FindMaintenanceByIdService(repoStub);
  });

  it('instancia com repositório mock', () => {
    expect(service).toBeDefined();
  });
});
