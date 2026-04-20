import type { Token } from '@/generated/prisma/client';
import { TokenType } from '@/generated/prisma/enums';

import type { ITokenRepository } from '../repositories/token.repository.interface';

import { PasswordResetTokenService } from './password-reset-token.service';
import { TokenGenerationService } from './token-generation.service';

describe('PasswordResetTokenService', () => {
  let service: PasswordResetTokenService;

  let create: jest.Mock;
  let findActiveBySubjectAndType: jest.Mock;
  let findByHash: jest.Mock;
  let markAsUsed: jest.Mock;
  let invalidateBySubjectAndType: jest.Mock;

  let generatePlainToken: jest.Mock;
  let hashToken: jest.Mock;
  let compareToken: jest.Mock;
  let computeExpiresAt: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    findActiveBySubjectAndType = jest.fn();
    findByHash = jest.fn();
    markAsUsed = jest.fn();
    invalidateBySubjectAndType = jest.fn().mockResolvedValue(undefined);

    generatePlainToken = jest.fn();
    hashToken = jest.fn();
    compareToken = jest.fn();
    computeExpiresAt = jest.fn();

    const repo = {
      create,
      findActiveBySubjectAndType,
      findByHash,
      markAsUsed,
      invalidateBySubjectAndType,
    } as unknown as ITokenRepository;

    const generation = {
      generatePlainToken,
      hashToken,
      compareToken,
      computeExpiresAt,
    } as unknown as TokenGenerationService;

    service = new PasswordResetTokenService(repo, generation);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('createPasswordResetToken invalida anteriores, persiste hash e devolve plain', async () => {
    const subjectId = 'subject-1';
    const expectedExpiresAt = new Date('2026-04-20T21:30:00.000Z');
    const persisted = {
      id: 'tok-1',
      tokenHash: 'hashed',
      expiresAt: expectedExpiresAt,
      type: TokenType.PASSWORD_RESET,
      subjectId,
    } as unknown as Token;

    generatePlainToken.mockReturnValue('plain-token');
    hashToken.mockResolvedValue('hashed');
    computeExpiresAt.mockReturnValue(expectedExpiresAt);
    create.mockResolvedValue(persisted);

    const result = await service.createPasswordResetToken(subjectId);

    expect(invalidateBySubjectAndType).toHaveBeenCalledWith(
      subjectId,
      TokenType.PASSWORD_RESET,
    );
    expect(computeExpiresAt).toHaveBeenCalledWith(30);
    expect(hashToken).toHaveBeenCalledWith('plain-token');
    expect(create).toHaveBeenCalledWith({
      subjectId,
      type: TokenType.PASSWORD_RESET,
      tokenHash: 'hashed',
      expiresAt: expectedExpiresAt,
    });
    expect(result).toEqual({ token: 'plain-token', tokenRecord: persisted });
  });

  it('invalidatePasswordResetTokens chama o repositório com o type correto', async () => {
    await service.invalidatePasswordResetTokens('subject-1');

    expect(invalidateBySubjectAndType).toHaveBeenCalledWith(
      'subject-1',
      TokenType.PASSWORD_RESET,
    );
  });
});
