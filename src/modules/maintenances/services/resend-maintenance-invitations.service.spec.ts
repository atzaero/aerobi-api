import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { MaintenanceInvitationMailerService } from './maintenance-invitation-mailer.service';
import { ResendMaintenanceInvitationsService } from './resend-maintenance-invitations.service';

describe('ResendMaintenanceInvitationsService', () => {
  let service: ResendMaintenanceInvitationsService;
  let findById: jest.Mock;
  let sendInvitations: jest.Mock;
  let throwIfAllFailed: jest.Mock;

  const publicPlan = {
    id: 'm1',
    aerodromeId: 'a1',
    securityCode: 'CODE1234',
    authorizedEmails: ['a@x.com', 'b@x.com'],
  };

  beforeEach(() => {
    findById = jest.fn();
    sendInvitations = jest.fn();
    throwIfAllFailed = jest.fn();

    service = new ResendMaintenanceInvitationsService(
      { findById } as unknown as MaintenanceRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      {
        sendInvitations,
        throwIfAllFailed,
      } as unknown as MaintenanceInvitationMailerService,
    );
  });

  it('lança 404 quando a intervenção não existe', async () => {
    findById.mockResolvedValue(null);

    await expect(
      service.execute('missing', { emails: ['a@x.com'] }),
    ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    expect(sendInvitations).not.toHaveBeenCalled();
  });

  it('lança 400 quando a intervenção não tem acesso público', async () => {
    findById.mockResolvedValue({ ...publicPlan, authorizedEmails: [] });

    await expect(
      service.execute('m1', { emails: ['a@x.com'] }),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.VALIDATION_FAILED,
      status: HttpStatus.BAD_REQUEST,
    } satisfies Partial<CustomHttpException>);
  });

  it('lança 400 quando algum e-mail não está autorizado', async () => {
    findById.mockResolvedValue(publicPlan);

    await expect(
      service.execute('m1', { emails: ['a@x.com', 'intruso@x.com'] }),
    ).rejects.toMatchObject({
      errorCode: ErrorCode.VALIDATION_FAILED,
      status: HttpStatus.BAD_REQUEST,
    } satisfies Partial<CustomHttpException>);
    expect(sendInvitations).not.toHaveBeenCalled();
  });

  it('reenvia convites únicos e retorna sent/failed', async () => {
    findById.mockResolvedValue(publicPlan);
    sendInvitations.mockResolvedValue({ sent: ['a@x.com'], failed: [] });

    const result = await service.execute('m1', {
      emails: ['A@x.com', 'a@x.com'],
    });

    expect(sendInvitations).toHaveBeenCalledWith(
      expect.objectContaining({
        maintenanceId: 'm1',
        aerodromeId: 'a1',
        emails: ['a@x.com'],
        securityCode: 'CODE1234',
      }),
    );
    expect(throwIfAllFailed).toHaveBeenCalledWith({
      sent: ['a@x.com'],
      failed: [],
    });
    expect(result).toEqual({ sent: ['a@x.com'], failed: [] });
  });

  it('propaga a falha quando todos os envios falham', async () => {
    findById.mockResolvedValue(publicPlan);
    sendInvitations.mockResolvedValue({ sent: [], failed: ['a@x.com'] });
    throwIfAllFailed.mockImplementation(() => {
      throw new CustomHttpException(
        'fail',
        HttpStatus.BAD_GATEWAY,
        ErrorCode.EMAIL_SEND_FAILED,
      );
    });

    await expect(
      service.execute('m1', { emails: ['a@x.com'] }),
    ).rejects.toMatchObject({ status: HttpStatus.BAD_GATEWAY });
  });
});
