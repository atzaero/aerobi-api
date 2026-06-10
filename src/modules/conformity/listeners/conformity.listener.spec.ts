import type { ConfigService } from '@nestjs/config';
import type { EventEmitter2 } from '@nestjs/event-emitter';

import { MovementSource, MovementType } from '@/generated/prisma/enums';

import type { OperationalEvent } from '@/generated/prisma/client';
import type { MovementCreatedEvent } from '@/modules/movements/events/movement-created.event';

import { MOVEMENT_NON_CONFORMITY_EVENT } from '../events/movement-non-conformity.event';
import type { FirestoreDirectoryPort } from '../ports/firestore-directory.port';
import type { OperationalEventRepository } from '../repositories/operational-event.repository';

import { ConformityListener } from './conformity.listener';

describe('ConformityListener', () => {
  let listener: ConformityListener;
  let findApprovedLandingRequestMatch: jest.Mock;
  let create: jest.Mock;
  let emit: jest.Mock;
  let configGet: jest.Mock;

  const baseEvent: MovementCreatedEvent = {
    movementId: 'mov-1',
    registration: 'PR-ZTT',
    aerodrome: 'SSCF',
    operationType: MovementType.LANDING,
    source: MovementSource.AUTOMATIC,
    readingDatetime: new Date('2026-06-08T16:52:39Z'),
  };

  const createdEvent: OperationalEvent = {
    id: 'oe-1',
  } as OperationalEvent;

  function build(): ConformityListener {
    const directory = {
      findApprovedLandingRequestMatch,
    } as unknown as FirestoreDirectoryPort;
    const repository = {
      create,
    } as unknown as OperationalEventRepository;
    const eventEmitter = { emit } as unknown as EventEmitter2;
    const config = { get: configGet } as unknown as ConfigService;
    return new ConformityListener(directory, repository, eventEmitter, config);
  }

  beforeEach(() => {
    findApprovedLandingRequestMatch = jest.fn().mockResolvedValue(null);
    create = jest.fn().mockResolvedValue(createdEvent);
    emit = jest.fn();
    configGet = jest.fn().mockReturnValue(undefined);
    listener = build();
  });

  it('(a) ignora decolagem sem consultar o port', async () => {
    await listener.handleMovementCreated({
      ...baseEvent,
      operationType: MovementType.TAKEOFF,
    });

    expect(findApprovedLandingRequestMatch).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('(b) ignora movimento manual sem consultar o port', async () => {
    await listener.handleMovementCreated({
      ...baseEvent,
      source: MovementSource.MANUAL,
    });

    expect(findApprovedLandingRequestMatch).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('(c) ignora aeródromo null e loga, sem consultar o port', async () => {
    const warn = jest
      .spyOn(listener['logger'], 'warn')
      .mockImplementation(() => undefined);

    await listener.handleMovementCreated({ ...baseEvent, aerodrome: null });

    expect(findApprovedLandingRequestMatch).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it('(d) com match encontrado não cria evento nem emite', async () => {
    findApprovedLandingRequestMatch.mockResolvedValue({
      id: 'lr-1',
      aircraftRegistration: 'PR-ZTT',
      icao: 'SSCF',
      status: 'APPROVED',
      requestDate: new Date('2026-06-08T15:00:00Z'),
    });

    await listener.handleMovementCreated(baseEvent);

    expect(findApprovedLandingRequestMatch).toHaveBeenCalledWith({
      registration: 'PR-ZTT',
      aerodromeIcao: 'SSCF',
      reference: baseEvent.readingDatetime,
      windowHours: 24,
    });
    expect(create).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('(e) sem match cria OperationalEvent e emite MOVEMENT_NON_CONFORMITY_EVENT', async () => {
    await listener.handleMovementCreated(baseEvent);

    expect(create).toHaveBeenCalledWith({
      type: 'NON_CONFORMITY_NO_LANDING_REQUEST',
      aerodrome: 'SSCF',
      movementId: 'mov-1',
      occurredAt: baseEvent.readingDatetime,
    });
    expect(emit).toHaveBeenCalledWith(MOVEMENT_NON_CONFORMITY_EVENT, {
      operationalEventId: 'oe-1',
      movementId: 'mov-1',
      registration: 'PR-ZTT',
      aerodrome: 'SSCF',
      occurredAt: baseEvent.readingDatetime,
    });
  });

  it('usa CONFORMITY_MATCH_WINDOW_HOURS do env (string) quando válido', async () => {
    configGet.mockReturnValue('48');
    listener = build();

    await listener.handleMovementCreated(baseEvent);

    expect(findApprovedLandingRequestMatch).toHaveBeenCalledWith(
      expect.objectContaining({ windowHours: 48 }),
    );
  });

  it('(f) erro do port é capturado e não relançado', async () => {
    const error = jest
      .spyOn(listener['logger'], 'error')
      .mockImplementation(() => undefined);
    findApprovedLandingRequestMatch.mockRejectedValue(
      new Error('firestore down'),
    );

    await expect(
      listener.handleMovementCreated(baseEvent),
    ).resolves.toBeUndefined();

    expect(create).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  });
});
