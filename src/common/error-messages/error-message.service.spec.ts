import { Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';

describe('ErrorMessageService', () => {
  let service: ErrorMessageService;

  beforeEach(() => {
    service = new ErrorMessageService();
  });

  it('retorna mensagem simples quando o code nao tem placeholders', () => {
    const msg = service.getMessage(ErrorCode.UNAUTHORIZED);
    expect(msg).toBe('Não autenticado. Credenciais ausentes ou inválidas.');
  });

  it('substitui placeholders pelos params fornecidos', () => {
    const msg = service.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
      RESOURCE: 'Aerodromo',
      ID: 'abc-123',
    });
    expect(msg).toBe(
      'Recurso Aerodromo com identificador abc-123 não encontrado.',
    );
  });

  it('aceita params numéricos e converte para string', () => {
    const msg = service.getMessage(ErrorCode.EMAIL_SEND_FAILED, {
      EMAIL: 42,
    });
    expect(msg).toBe(
      'Falha ao enviar email para 42. Tente novamente mais tarde.',
    );
  });

  it('mantém placeholders intactos quando params nao é informado', () => {
    const msg = service.getMessage(ErrorCode.TOKEN_EXPIRED);
    expect(msg).toBe('Token expirado em [EXPIRED_AT].');
  });

  it('ignora chaves extras em params sem quebrar', () => {
    const msg = service.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
      RESOURCE: 'User',
      ID: 'u1',
      IGNORED: 'x',
    });
    expect(msg).toBe('Recurso User com identificador u1 não encontrado.');
  });

  it('retorna fallback genérico e loga warning quando o code nao existe no mapa', () => {
    const warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    const msg = service.getMessage('DOES_NOT_EXIST' as ErrorCode);

    expect(msg).toBe('Ocorreu um erro inesperado.');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('DOES_NOT_EXIST'),
    );

    warnSpy.mockRestore();
  });
});
