import { ErrorMessageService } from '@/common/error-messages/error-message.service';

import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { FindMaintenanceByIdService } from './find-maintenance-by-id.service';

describe('FindMaintenanceByIdService', () => {
  let service: FindMaintenanceByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    service = new FindMaintenanceByIdService(
      { findById } as unknown as MaintenanceRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('mapeia a intervenção encontrada para a resposta da API', async () => {
    findById.mockResolvedValue({
      id: 'm1',
      name: 'Plano',
      aerodromeId: 'a1',
      securityCode: 'CODE1234',
      authorizedEmails: ['a@x.com'],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      aerodrome: { group: { uf: 'PI' } },
    });

    const result = await service.execute('m1');

    expect(result).toEqual({
      id: 'm1',
      name: 'Plano',
      aerodromeId: 'a1',
      uf: 'PI',
      securityCode: 'CODE1234',
      authorizedEmails: ['a@x.com'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });

  it('lança 404 quando a intervenção não existe', async () => {
    findById.mockResolvedValue(null);

    await expect(service.execute('missing')).rejects.toMatchObject({
      status: 404,
    });
  });
});
