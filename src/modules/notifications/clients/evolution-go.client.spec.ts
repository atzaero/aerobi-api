import { ServiceUnavailableException } from '@nestjs/common';
import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

import { EvolutionGoClient } from './evolution-go.client';
import { WhatsappSendError } from './whatsapp-send.error';

describe('EvolutionGoClient', () => {
  let request: jest.Mock;
  let config: Record<string, string>;

  const build = (): EvolutionGoClient => {
    const http = { request } as unknown as HttpService;
    const configService = {
      get: (key: string, def?: string) => config[key] ?? def ?? '',
    } as unknown as ConfigService;
    return new EvolutionGoClient(http, configService);
  };

  beforeEach(() => {
    request = jest.fn();
    config = {
      EVOLUTION_GO_BASE_URL: 'https://evo.example.com/',
      EVOLUTION_GO_API_KEY: 'secret',
    };
  });

  it('envia texto: normaliza número, monta URL/headers/body e devolve messageId', async () => {
    request.mockReturnValue(
      of({
        status: 200,
        data: { data: { Info: { ID: 'wamid-1' } }, message: 'success' },
      }),
    );

    const result = await build().sendText({
      to: '(11) 99999-0001',
      text: 'olá',
    });

    expect(result).toEqual({ to: '5511999990001', messageId: 'wamid-1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://evo.example.com/send/text',
        headers: { 'Content-Type': 'application/json', apikey: 'secret' },
        data: { number: '5511999990001', text: 'olá' },
      }),
    );
  });

  it('telefone inválido → erro não-retryable, sem chamar o gateway', async () => {
    const promise = build().sendText({ to: '123', text: 'x' });
    await expect(promise).rejects.toBeInstanceOf(WhatsappSendError);
    await expect(promise).rejects.toMatchObject({ retryable: false });
    expect(request).not.toHaveBeenCalled();
  });

  it('5xx do gateway → erro retryable', async () => {
    request.mockReturnValue(of({ status: 502, data: {} }));
    await expect(
      build().sendText({ to: '11999990001', text: 'x' }),
    ).rejects.toMatchObject({ retryable: true, status: 502 });
  });

  it('4xx do gateway → erro não-retryable', async () => {
    request.mockReturnValue(of({ status: 400, data: { error: 'bad' } }));
    await expect(
      build().sendText({ to: '11999990001', text: 'x' }),
    ).rejects.toMatchObject({ retryable: false, status: 400 });
  });

  it('sem base URL configurada → ServiceUnavailableException', async () => {
    delete config.EVOLUTION_GO_BASE_URL;
    await expect(
      build().sendText({ to: '11999990001', text: 'x' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
