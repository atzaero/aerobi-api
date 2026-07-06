import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { MaintenanceGuessRepository } from '@/modules/guesses/repositories/maintenance-guess.repository';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { GetPublicMaintenanceFeedbackService } from './get-public-maintenance-feedback.service';

describe('GetPublicMaintenanceFeedbackService', () => {
  let service: GetPublicMaintenanceFeedbackService;
  let findById: jest.Mock;
  let findActiveAerodrome: jest.Mock;
  let findManyByMaintenanceId: jest.Mock;
  let findActiveByMaintenanceId: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    findActiveAerodrome = jest.fn();
    findManyByMaintenanceId = jest.fn();
    findActiveByMaintenanceId = jest.fn();

    service = new GetPublicMaintenanceFeedbackService(
      { findById, findActiveAerodrome } as unknown as MaintenanceRepository,
      {
        findManyByMaintenanceId,
      } as unknown as MaintenanceTaskRepository,
      {
        findActiveByMaintenanceId,
      } as unknown as MaintenanceGuessRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
    );
  });

  it('retorna 404 quando acesso público está desabilitado', async () => {
    findById.mockResolvedValue({
      id: 'maint-1',
      name: 'Plano',
      aerodromeId: 'aero-1',
      securityCode: null,
      authorizedEmails: [],
    });

    await expect(service.execute('maint-1', {})).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('não expõe securityCode nem authorizedEmails', async () => {
    findById.mockResolvedValue({
      id: 'maint-1',
      name: 'Plano',
      aerodromeId: 'aero-1',
      securityCode: 'SECRET12',
      authorizedEmails: ['stake@x.com'],
    });
    findActiveAerodrome.mockResolvedValue({
      id: 'aero-1',
      name: 'Aeródromo',
      icao: 'SBPI',
      group: { uf: 'PI' },
    });
    findManyByMaintenanceId.mockResolvedValue([]);
    findActiveByMaintenanceId.mockResolvedValue([]);

    const result = await service.execute('maint-1', {
      email: 'stake@x.com',
    });

    expect(result.maintenance?.authorizedEmailsCount).toBe(1);
    expect(result).not.toHaveProperty('securityCode');
    expect(result.maintenance).not.toHaveProperty('authorizedEmails');
    expect(result.emailAuthorized).toBe(true);
    expect(result.canSubmitGuess).toBe(true);
  });
});
