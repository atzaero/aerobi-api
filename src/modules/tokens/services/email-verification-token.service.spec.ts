import type { Token } from '@/generated/prisma/client';
import { TokenType } from '@/generated/prisma/enums';

import type { ITokenRepository } from '../repositories/token.repository.interface';

import { EmailVerificationTokenService } from './email-verification-token.service';
import { TokenGenerationService } from './token-generation.service';

describe('EmailVerificationTokenService', () => {
  let service: EmailVerificationTokenService;

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

    service = new EmailVerificationTokenService(repo, generation);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('createEmailVerificationToken invalida anteriores, persiste hash e devolve plain', async () => {
    const subjectId = 'subject-1';
    const expectedExpiresAt = new Date('2026-04-20T21:00:00.000Z');
    const persisted = {
      id: 'tok-1',
      tokenHash: 'hashed',
      expiresAt: expectedExpiresAt,
      type: TokenType.EMAIL_VERIFICATION,
      subjectId,
    } as unknown as Token;

    generatePlainToken.mockReturnValue('plain-token');
    hashToken.mockResolvedValue('hashed');
    computeExpiresAt.mockReturnValue(expectedExpiresAt);
    create.mockResolvedValue(persisted);

    const result = await service.createEmailVerificationToken(subjectId);

    expect(invalidateBySubjectAndType).toHaveBeenCalledWith(
      subjectId,
      TokenType.EMAIL_VERIFICATION,
    );
    expect(computeExpiresAt).toHaveBeenCalledWith(60);
    expect(hashToken).toHaveBeenCalledWith('plain-token');
    expect(create).toHaveBeenCalledWith({
      subjectId,
      type: TokenType.EMAIL_VERIFICATION,
      tokenHash: 'hashed',
      expiresAt: expectedExpiresAt,
    });
    expect(result).toEqual({ token: 'plain-token', tokenRecord: persisted });
  });

  it('usa expirationMinutes customizado quando informado', async () => {
    generatePlainToken.mockReturnValue('plain');
    hashToken.mockResolvedValue('hashed');
    computeExpiresAt.mockReturnValue(new Date());
    create.mockResolvedValue({} as Token);

    await service.createEmailVerificationToken('subject-1', 15);

    expect(computeExpiresAt).toHaveBeenCalledWith(15);
  });

  it('invalidateEmailVerificationTokens chama o repositório com o type correto', async () => {
    await service.invalidateEmailVerificationTokens('subject-1');

    expect(invalidateBySubjectAndType).toHaveBeenCalledWith(
      'subject-1',
      TokenType.EMAIL_VERIFICATION,
    );
  });
});
