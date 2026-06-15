import { NotificationMessageBuilder } from '../builders/notification-message.builder';
import { WhatsappClient } from '../clients/whatsapp-client.port';
import { WhatsappSendError } from '../clients/whatsapp-send.error';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationDispatchService } from './notification-dispatch.service';

describe('NotificationDispatchService', () => {
  let sendText: jest.Mock;
  let build: jest.Mock;
  let service: NotificationDispatchService;

  beforeEach(() => {
    sendText = jest.fn();
    build = jest.fn().mockReturnValue('texto');
    const client = { sendText } as unknown as WhatsappClient;
    const builder: NotificationMessageBuilder = {
      type: NotificationType.MOVEMENT_CREATED,
      build,
    };
    service = new NotificationDispatchService(client, [builder]);
  });

  it('renderiza o texto uma vez e envia para todos os destinatários', async () => {
    sendText.mockResolvedValue({ to: 'x', messageId: 'm' });

    const res = await service.dispatch({
      recipients: ['111', '222'],
      type: NotificationType.MOVEMENT_CREATED,
      params: { a: 1 },
    });

    expect(build).toHaveBeenCalledTimes(1);
    expect(build).toHaveBeenCalledWith({ a: 1 });
    expect(sendText).toHaveBeenCalledTimes(2);
    expect(sendText).toHaveBeenCalledWith({ to: '111', text: 'texto' });
    expect(res.sent).toBe(2);
    expect(res.failed).toBe(0);
  });

  it('tolera falha por destinatário sem derrubar o lote', async () => {
    sendText
      .mockResolvedValueOnce({ to: '111', messageId: null })
      .mockRejectedValueOnce(new WhatsappSendError('inválido', false));

    const res = await service.dispatch({
      recipients: ['111', '222'],
      type: NotificationType.MOVEMENT_CREATED,
      params: {},
    });

    expect(res.sent).toBe(1);
    expect(res.failed).toBe(1);
    expect(res.items.find((i) => i.to === '222')?.status).toBe('failed');
  });

  it('dedupe destinatários e ignora vazios', async () => {
    sendText.mockResolvedValue({ to: 'x', messageId: null });

    await service.dispatch({
      recipients: ['111', ' 111 ', '', '222'],
      type: NotificationType.MOVEMENT_CREATED,
      params: {},
    });

    expect(sendText).toHaveBeenCalledTimes(2);
  });

  it('recipients vazios → resultado vazio, sem renderizar nem enviar', async () => {
    const res = await service.dispatch({
      recipients: [],
      type: NotificationType.MOVEMENT_CREATED,
      params: {},
    });

    expect(build).not.toHaveBeenCalled();
    expect(sendText).not.toHaveBeenCalled();
    expect(res.sent).toBe(0);
  });

  it('lança quando não há builder registrado para o tipo', async () => {
    await expect(
      service.dispatch({
        recipients: ['111'],
        type: NotificationType.MOVEMENTS_BATCH_SUMMARY,
        params: {},
      }),
    ).rejects.toThrow(/builder/i);
  });
});
