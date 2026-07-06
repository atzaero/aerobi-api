import { MovementSource, MovementType } from '@/generated/prisma/enums';

import type { MovementCreatedEvent } from '@/modules/movements/events/movement-created.event';
import type {
  DirectoryPort,
  GroupContact,
} from '@/modules/conformity/ports/directory.port';

import { NotificationType } from '../enums/notification-type.enum';
import type { NotificationDispatchService } from '../services/notification-dispatch.service';
import type { NotificationDispatchCommand } from '../types/notification-dispatch.types';
import { MovementNotificationsListener } from './movement-notifications.listener';

describe('MovementNotificationsListener', () => {
  let findAerodromeGroupByIcao: jest.Mock;
  let findGroupContacts: jest.Mock;
  let dispatch: jest.Mock<Promise<void>, [NotificationDispatchCommand]>;
  let listener: MovementNotificationsListener;

  const contact = (over: Partial<GroupContact>): GroupContact => ({
    email: 'c@example.com',
    role: 'coordinator',
    displayName: 'Coord',
    phone: '+55 11 99999-0001',
    ...over,
  });

  const event = (
    over: Partial<MovementCreatedEvent> = {},
  ): MovementCreatedEvent => ({
    movementId: 'm-1',
    registration: 'PRZTT',
    aerodrome: 'SSCF',
    operationType: MovementType.LANDING,
    source: MovementSource.AUTOMATIC,
    readingDatetime: new Date('2026-06-08T16:52:39Z'),
    batched: false,
    ...over,
  });

  beforeEach(() => {
    findAerodromeGroupByIcao = jest.fn();
    findGroupContacts = jest.fn();
    dispatch = jest
      .fn<Promise<void>, [NotificationDispatchCommand]>()
      .mockResolvedValue(undefined);
    const directory = {
      findAerodromeGroupByIcao,
      findGroupContacts,
    } as unknown as DirectoryPort;
    const dispatchService = {
      dispatch,
    } as unknown as NotificationDispatchService;
    listener = new MovementNotificationsListener(directory, dispatchService);
  });

  describe('handleMovementCreated (avulso)', () => {
    it('ignora itens de lote (batched)', async () => {
      await listener.handleMovementCreated(event({ batched: true }));
      expect(findAerodromeGroupByIcao).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('ignora movimento sem aeródromo', async () => {
      await listener.handleMovementCreated(event({ aerodrome: null }));
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('resolve grupo+coordenadores com telefone e despacha', async () => {
      findAerodromeGroupByIcao.mockResolvedValue({
        aerodromeId: 'a1',
        groupId: 'g1',
      });
      findGroupContacts.mockResolvedValue([
        contact({ phone: '+55 11 99999-0001' }),
        contact({ phone: null }),
      ]);

      await listener.handleMovementCreated(event());

      expect(findGroupContacts).toHaveBeenCalledWith('g1', ['coordinator']);
      expect(dispatch).toHaveBeenCalledWith({
        recipients: ['5511999990001'],
        type: NotificationType.MOVEMENT_CREATED,
        params: {
          registration: 'PRZTT',
          aerodrome: 'SSCF',
          operationType: MovementType.LANDING,
          readingDatetime: '2026-06-08T16:52:39.000Z',
        },
      });
    });

    it('não despacha quando nenhum coordenador tem telefone', async () => {
      findAerodromeGroupByIcao.mockResolvedValue({ groupId: 'g1' });
      findGroupContacts.mockResolvedValue([contact({ phone: null })]);

      await listener.handleMovementCreated(event());

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('não despacha quando o aeródromo não tem grupo', async () => {
      findAerodromeGroupByIcao.mockResolvedValue(null);
      await listener.handleMovementCreated(event());
      expect(findGroupContacts).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('engole erros do diretório (não relança)', async () => {
      findAerodromeGroupByIcao.mockRejectedValue(new Error('firestore down'));
      await expect(
        listener.handleMovementCreated(event()),
      ).resolves.toBeUndefined();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('canoniza telefones e descarta inválidos antes de despachar', async () => {
      findAerodromeGroupByIcao.mockResolvedValue({ groupId: 'g1' });
      findGroupContacts.mockResolvedValue([
        contact({ phone: '(11) 99999-0001' }),
        contact({ phone: '123' }),
        contact({ phone: null }),
      ]);

      await listener.handleMovementCreated(event());

      const call = dispatch.mock.calls[0][0];
      expect(call.recipients).toEqual(['5511999990001']);
    });

    it('não despacha quando o grupo resolvido tem groupId vazio', async () => {
      findAerodromeGroupByIcao.mockResolvedValue({
        aerodromeId: 'a1',
        groupId: '',
      });

      await listener.handleMovementCreated(event());

      expect(findGroupContacts).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleBatchCreated (resumo agregado)', () => {
    it('agrupa por grupo: aeródromos do mesmo grupo → 1 resumo', async () => {
      findAerodromeGroupByIcao.mockImplementation((icao: string) =>
        Promise.resolve({ groupId: icao === 'SBSP' ? 'g2' : 'g1' }),
      );
      findGroupContacts.mockResolvedValue([
        contact({ phone: '+55 11 99999-0001' }),
      ]);

      await listener.handleBatchCreated({
        movements: [
          event({ aerodrome: 'SSCF' }),
          event({ aerodrome: 'SSCF', registration: 'PSABC' }),
        ],
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      const call = dispatch.mock.calls[0][0];
      expect(call.type).toBe(NotificationType.MOVEMENTS_BATCH_SUMMARY);
      expect(call.recipients).toEqual(['5511999990001']);
      expect(call.params.count).toBe(2);
      expect(call.params.items).toHaveLength(2);
    });

    it('grupos distintos → um resumo por grupo', async () => {
      findAerodromeGroupByIcao.mockImplementation((icao: string) =>
        Promise.resolve({ groupId: icao === 'SBSP' ? 'g2' : 'g1' }),
      );
      findGroupContacts.mockResolvedValue([contact({})]);

      await listener.handleBatchCreated({
        movements: [event({ aerodrome: 'SSCF' }), event({ aerodrome: 'SBSP' })],
      });

      expect(dispatch).toHaveBeenCalledTimes(2);
    });

    it('descarta movimentos sem aeródromo', async () => {
      findAerodromeGroupByIcao.mockResolvedValue({ groupId: 'g1' });
      findGroupContacts.mockResolvedValue([contact({})]);

      await listener.handleBatchCreated({
        movements: [event({ aerodrome: null })],
      });

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('best-effort por grupo: falha de um grupo não impede os demais', async () => {
      findAerodromeGroupByIcao.mockImplementation((icao: string) =>
        Promise.resolve({ groupId: icao === 'SBSP' ? 'g2' : 'g1' }),
      );
      findGroupContacts.mockImplementation((groupId: string) =>
        groupId === 'g1'
          ? Promise.reject(new Error('firestore timeout'))
          : Promise.resolve([contact({})]),
      );

      await expect(
        listener.handleBatchCreated({
          movements: [
            event({ aerodrome: 'SSCF' }),
            event({ aerodrome: 'SBSP' }),
          ],
        }),
      ).resolves.toBeUndefined();

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls[0][0].recipients).toEqual(['5511999990001']);
    });
  });
});
