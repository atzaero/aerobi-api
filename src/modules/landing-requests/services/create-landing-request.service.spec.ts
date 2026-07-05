import type { ConfigService } from '@nestjs/config';

import type { EmailService } from '@/common/email/email.service';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import type { TargetAerodrome } from '../repositories/landing-request.repository.interface';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';
import { CreateLandingRequestService } from './create-landing-request.service';
import type { LookupRabAircraftService } from './lookup-rab-aircraft.service';
import type { ValidatePilotLicenseService } from './validate-pilot-license.service';

const validDto = (
  overrides: Partial<CreateLandingRequestDTO> = {},
): CreateLandingRequestDTO => ({
  aerodromeId: 'aero-1',
  departureIcao: 'SBSP',
  nextDestinationIcao: 'SBRJ',
  departureAt: new Date('2030-01-01T01:00:00.000Z'),
  landingAt: new Date('2030-01-01T05:00:00.000Z'),
  exitAfterLandingAt: new Date('2030-01-01T07:00:00.000Z'),
  requesterName: 'Maria Souza',
  email: 'piloto@example.com',
  phoneContact: '+5511999999999',
  pilotName: 'João da Silva',
  pilotCpf: '12345678909',
  anacPilotCode: '204603',
  aircraftRegistration: 'PT-ABC',
  foreignRegistration: false,
  aircraftModel: 'Cessna 172',
  peopleOnBoard: 3,
  confirmedTrue: true,
  acceptedTerms: true,
  ...overrides,
});

const openTarget: TargetAerodrome = {
  id: 'aero-1',
  icao: 'sbsp',
  name: 'Congonhas',
  isOpen: true,
  groupId: 'grp-1',
  uf: 'SP',
};

describe('CreateLandingRequestService', () => {
  let service: CreateLandingRequestService;
  let findTargetAerodrome: jest.Mock;
  let createWithAircraft: jest.Mock;
  let softDelete: jest.Mock;
  let validateLicense: jest.Mock;
  let lookupRab: jest.Mock;
  let send: jest.Mock;
  let findGroupStaffEmails: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findTargetAerodrome = jest.fn().mockResolvedValue(openTarget);
    createWithAircraft = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(buildLandingRequestFixture({ uf: 'SP' })),
      );
    softDelete = jest.fn().mockResolvedValue(buildLandingRequestFixture());
    validateLicense = jest.fn().mockResolvedValue(undefined);
    lookupRab = jest
      .fn()
      .mockResolvedValue({ period: '2026-07', marcas: 'PTABC' });
    send = jest.fn().mockResolvedValue(true);
    findGroupStaffEmails = jest.fn().mockResolvedValue([]);
    record = jest.fn().mockResolvedValue(undefined);

    service = new CreateLandingRequestService(
      {
        findTargetAerodrome,
        createWithAircraft,
        softDelete,
      } as unknown as LandingRequestRepository,
      { execute: validateLicense } as unknown as ValidatePilotLicenseService,
      { execute: lookupRab } as unknown as LookupRabAircraftService,
      { send } as unknown as EmailService,
      { findGroupStaffEmails } as unknown as UserRepository,
      {
        get: jest.fn().mockReturnValue('https://app'),
      } as unknown as ConfigService,
      { record } as unknown as AuditRecorderService,
      new ErrorMessageService(),
    );
  });

  it('fluxo feliz nacional: valida licença + RAB, grava com snapshot e retorna { id, uf }', async () => {
    const out = await service.execute(validDto());
    expect(validateLicense).toHaveBeenCalledWith('12345678909', '204603');
    expect(lookupRab).toHaveBeenCalledWith('PT-ABC', false);
    expect(createWithAircraft).toHaveBeenCalledTimes(1);
    expect(createWithAircraft).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ marcas: 'PTABC' }),
    );
    expect(record).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalled();
    expect(typeof out.id).toBe('string');
    expect(out.uf).toBe('SP');
  });

  it('matrícula estrangeira: pula o snapshot RAB (aircraft null)', async () => {
    lookupRab.mockResolvedValue(null);
    await service.execute(
      validDto({ foreignRegistration: true, aircraftRegistration: 'N12345' }),
    );
    expect(lookupRab).toHaveBeenCalledWith('N12345', true);
    expect(createWithAircraft).toHaveBeenCalledWith(expect.anything(), null);
  });

  it('aeródromo fechado → 409, não grava', async () => {
    findTargetAerodrome.mockResolvedValue({ ...openTarget, isOpen: false });
    await expect(service.execute(validDto())).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(createWithAircraft).not.toHaveBeenCalled();
  });

  it('aeródromo inexistente → 404', async () => {
    findTargetAerodrome.mockResolvedValue(null);
    await expect(service.execute(validDto())).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(createWithAircraft).not.toHaveBeenCalled();
  });

  it('licença ANAC inválida → propaga erro, não grava', async () => {
    validateLicense.mockRejectedValue(
      new CustomHttpException('inválida', 400, 'VALIDATION_FAILED' as never),
    );
    await expect(service.execute(validDto())).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(createWithAircraft).not.toHaveBeenCalled();
  });

  it('agenda inválida → 400 antes de qualquer I/O', async () => {
    await expect(
      service.execute(
        validDto({ landingAt: new Date('2030-01-01T00:30:00.000Z') }),
      ),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(findTargetAerodrome).not.toHaveBeenCalled();
  });

  it('comprovante falha → soft-delete compensatório + EMAIL_SEND_FAILED', async () => {
    send.mockResolvedValue(false);
    await expect(service.execute(validDto())).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(softDelete).toHaveBeenCalledWith(expect.any(String), 'system');
  });
});
