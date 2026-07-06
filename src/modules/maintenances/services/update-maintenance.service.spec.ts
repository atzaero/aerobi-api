import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { UpdateMaintenanceService } from './update-maintenance.service';

describe('UpdateMaintenanceService', () => {
  let service: UpdateMaintenanceService;

  beforeEach(() => {
    const repoStub = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as MaintenanceRepository;
    service = new UpdateMaintenanceService(repoStub);
  });

  it('instancia com repositório mock', () => {
    expect(service).toBeDefined();
  });
});
