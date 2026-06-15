import type { ConfigService } from '@nestjs/config';

import type { EmailService } from '@/common/email/email.service';

import type { OperationalEvent } from '@/generated/prisma/client';

import type { MovementNonConformityEvent } from '../events/movement-non-conformity.event';
import type {
  AerodromeGroup,
  FirestoreDirectoryPort,
  GroupContact,
} from '../ports/firestore-directory.port';
import type {
  FindRecentNotifiedInput,
  OperationalEventRepository,
} from '../repositories/operational-event.repository';

import { NotificationListener } from './notification.listener';

describe('NotificationListener', () => {
  let listener: NotificationListener;
  let findAerodromeGroupByIcao: jest.Mock<
    Promise<AerodromeGroup | null>,
    [string]
  >;
  let findGroupContacts: jest.Mock<Promise<GroupContact[]>, [string, string[]]>;
  let findRecentNotified: jest.Mock<
    Promise<OperationalEvent | null>,
    [FindRecentNotifiedInput]
  >;
  let markNotified: jest.Mock<Promise<void>, [string, Date]>;
  let send: jest.Mock<Promise<boolean>, [unknown]>;
  let configGet: jest.Mock<string | number | undefined, [string]>;

  const recentNotified = { id: 'oe-0' } as OperationalEvent;

  const event: MovementNonConformityEvent = {
    operationalEventId: 'oe-1',
    movementId: 'mov-1',
    registration: 'PR-ZTT',
    aerodrome: 'SSCF',
    occurredAt: new Date('2026-06-08T16:52:39Z'),
  };

  const contacts: GroupContact[] = [
    {
      email: 'coord@example.com',
      role: 'coordinator',
      displayName: 'Coord',
      phone: '+55 11 99999-0001',
    },
    {
      email: 'op@example.com',
      role: 'operator',
      displayName: null,
      phone: null,
    },
  ];

  function build(): NotificationListener {
    const directory = {
      findAerodromeGroupByIcao,
      findGroupContacts,
    } as unknown as FirestoreDirectoryPort;
    const repository = {
      findRecentNotified,
      markNotified,
    } as unknown as OperationalEventRepository;
    const emailService = { send } as unknown as EmailService;
    const config = { get: configGet } as unknown as ConfigService;
    return new NotificationListener(
      directory,
      repository,
      emailService,
      config,
    );
  }

  beforeEach(() => {
    findRecentNotified = jest.fn<
      Promise<OperationalEvent | null>,
      [FindRecentNotifiedInput]
    >();
    findRecentNotified.mockResolvedValue(null);
    findAerodromeGroupByIcao = jest.fn<
      Promise<AerodromeGroup | null>,
      [string]
    >();
    findAerodromeGroupByIcao.mockResolvedValue({
      aerodromeId: 'aer-1',
      groupId: 'grp-1',
    });
    findGroupContacts = jest.fn<Promise<GroupContact[]>, [string, string[]]>();
    findGroupContacts.mockResolvedValue(contacts);
    markNotified = jest.fn<Promise<void>, [string, Date]>();
    markNotified.mockResolvedValue(undefined);
    send = jest.fn<Promise<boolean>, [unknown]>();
    send.mockResolvedValue(true);
    configGet = jest.fn<string | number | undefined, [string]>();
    configGet.mockReturnValue(undefined);
    listener = build();
  });

  it('(a) happy path: resolve grupo+contactos, envia e-mail e marca notificado', async () => {
    await listener.handle(event);

    const dedupeInput = findRecentNotified.mock.calls[0][0];
    expect(dedupeInput.aerodrome).toBe('SSCF');
    expect(dedupeInput.registration).toBe('PR-ZTT');
    expect(dedupeInput.since).toBeInstanceOf(Date);
    expect(findGroupContacts).toHaveBeenCalledWith('grp-1', [
      'coordinator',
      'operator',
    ]);
    expect(send).toHaveBeenCalledWith({
      to: ['coord@example.com', 'op@example.com'],
      subject: 'Pouso sem solicitação em SSCF',
      template: 'landing_non_conformity',
      variables: {
        AERODROME: 'SSCF',
        REGISTRATION: 'PR-ZTT',
        OCCURRED_AT: event.occurredAt.toISOString(),
      },
    });
    expect(markNotified).toHaveBeenCalledWith('oe-1', expect.any(Date));
  });

  it('(b) dedupe: notificação recente encontrada → não envia nem marca', async () => {
    findRecentNotified.mockResolvedValue(recentNotified);

    await listener.handle(event);

    expect(findAerodromeGroupByIcao).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(markNotified).not.toHaveBeenCalled();
  });

  it('(c) grupo null → não envia nem marca', async () => {
    findAerodromeGroupByIcao.mockResolvedValue(null);

    await listener.handle(event);

    expect(findGroupContacts).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(markNotified).not.toHaveBeenCalled();
  });

  it('(d) contactos vazios → não envia nem marca', async () => {
    findGroupContacts.mockResolvedValue([]);

    await listener.handle(event);

    expect(send).not.toHaveBeenCalled();
    expect(markNotified).not.toHaveBeenCalled();
  });

  it('(e) erro do port é capturado e não relançado', async () => {
    const error = jest
      .spyOn(listener['logger'], 'error')
      .mockImplementation(() => undefined);
    findAerodromeGroupByIcao.mockRejectedValue(new Error('firestore down'));

    await expect(listener.handle(event)).resolves.toBeUndefined();

    expect(send).not.toHaveBeenCalled();
    expect(markNotified).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  });

  it('(e) erro do emailService é capturado e não relançado', async () => {
    const error = jest
      .spyOn(listener['logger'], 'error')
      .mockImplementation(() => undefined);
    send.mockRejectedValue(new Error('smtp down'));

    await expect(listener.handle(event)).resolves.toBeUndefined();

    expect(markNotified).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  });

  it('usa CONFORMITY_NOTIFY_DEDUPE_MINUTES do env (string) quando válido', async () => {
    configGet.mockReturnValue('120');
    listener = build();
    const before = Date.now() - 120 * 60000;

    await listener.handle(event);

    const since = findRecentNotified.mock.calls[0][0].since;
    // janela de 120 min reflectida em `since` (margem para o tick do teste).
    expect(since.getTime()).toBeLessThanOrEqual(
      Date.now() - 120 * 60000 + 1000,
    );
    expect(since.getTime()).toBeGreaterThanOrEqual(before - 1000);
  });
});
