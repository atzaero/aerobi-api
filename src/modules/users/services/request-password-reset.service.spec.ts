import { EventEmitter2 } from '@nestjs/event-emitter';

import { PasswordResetTokenService } from '@/modules/tokens/services/password-reset-token.service';

import type { UserRepository } from '../repositories/user.repository';
import {
  buildPendingUserFixture,
  buildUserFixture,
} from '../testing/user.fixtures';

import { RequestPasswordResetService } from './request-password-reset.service';

describe('RequestPasswordResetService', () => {
  let service: RequestPasswordResetService;

  let findByEmail: jest.Mock;
  let createPasswordResetToken: jest.Mock;
  let emit: jest.Mock;

  beforeEach(() => {
    findByEmail = jest.fn();
    createPasswordResetToken = jest.fn();
    emit = jest.fn();

    const userRepository = { findByEmail } as unknown as UserRepository;
    const passwordResetTokenService = {
      createPasswordResetToken,
    } as unknown as PasswordResetTokenService;
    const eventEmitter = { emit } as unknown as EventEmitter2;

    service = new RequestPasswordResetService(
      userRepository,
      passwordResetTokenService,
      eventEmitter,
    );
  });

  const GENERIC =
    'Se o email estiver registrado, um link de redefinição foi enviado.';

  it('usuário ativo (convite aceito) → emite token + evento e retorna mensagem genérica', async () => {
    findByEmail.mockResolvedValue(
      buildUserFixture({ id: 'u-1', email: 'target@x', name: 'Alvo' }),
    );
    const expiresAt = new Date('2026-07-01T00:00:00.000Z');
    createPasswordResetToken.mockResolvedValue({
      token: 'plain-reset',
      tokenRecord: { id: 'tok-1', expiresAt },
    });

    const result = await service.execute({
      email: 'target@x',
      ipAddress: '203.0.113.5',
    });

    expect(findByEmail).toHaveBeenCalledWith('target@x');
    expect(createPasswordResetToken).toHaveBeenCalledWith('u-1');
    expect(emit).toHaveBeenCalledTimes(1);
    const [eventName, payload] = emit.mock.calls[0] as [
      string,
      {
        userId: string;
        email: string;
        name: string;
        resetTokenPlain: string;
        expiresAt: Date;
        ipAddress?: string;
      },
    ];
    expect(eventName).toBe('password-reset.token.sent');
    expect(payload).toMatchObject({
      userId: 'u-1',
      email: 'target@x',
      name: 'Alvo',
      resetTokenPlain: 'plain-reset',
      expiresAt,
      ipAddress: '203.0.113.5',
    });
    expect(result.message).toBe(GENERIC);
  });

  it('email inexistente → mensagem genérica sem emitir token (anti-enumeration)', async () => {
    findByEmail.mockResolvedValue(null);

    const result = await service.execute({ email: 'ghost@x' });

    expect(result.message).toBe(GENERIC);
    expect(createPasswordResetToken).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('usuário soft-deletado → mensagem genérica sem emitir token', async () => {
    findByEmail.mockResolvedValue(
      buildUserFixture({ email: 'target@x', deletedAt: new Date() }),
    );

    const result = await service.execute({ email: 'target@x' });

    expect(result.message).toBe(GENERIC);
    expect(createPasswordResetToken).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('usuário pendente (convite não aceito) → mensagem genérica sem emitir token', async () => {
    findByEmail.mockResolvedValue(
      buildPendingUserFixture({ email: 'target@x' }),
    );

    const result = await service.execute({ email: 'target@x' });

    expect(result.message).toBe(GENERIC);
    expect(createPasswordResetToken).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
