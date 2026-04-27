import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { Token } from '@/generated/prisma/client';
import { TokenType } from '@/generated/prisma/enums';

import type { ITokenRepository } from '../repositories/token.repository.interface';

import { TokenGenerationService } from './token-generation.service';
import { TokenValidationService } from './token-validation.service';

function buildTokenRecord(overrides: Partial<Token> = {}): Token {
  const now = new Date();
  return {
    id: 'token-id',
    type: TokenType.EMAIL_VERIFICATION,
    tokenHash: 'hashed',
    expiresAt: new Date(now.getTime() + 60 * 60_000),
    used: false,
    metadata: null,
    subjectId: 'subject-id',
    createdAt: now,
    createdBy: null,
    updatedAt: now,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Token;
}

describe('TokenValidationService', () => {
  let service: TokenValidationService;

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
    invalidateBySubjectAndType = jest.fn();

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

    const errorMessages = new ErrorMessageService();

    service = new TokenValidationService(repo, generation, errorMessages);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('retorna o registro quando token é válido', async () => {
    const record = buildTokenRecord();
    findActiveBySubjectAndType.mockResolvedValue(record);
    compareToken.mockResolvedValue(true);

    const out = await service.validate(
      'plain',
      'subject-id',
      TokenType.EMAIL_VERIFICATION,
    );

    expect(out).toBe(record);
    expect(findActiveBySubjectAndType).toHaveBeenCalledWith(
      'subject-id',
      TokenType.EMAIL_VERIFICATION,
    );
    expect(compareToken).toHaveBeenCalledWith('plain', 'hashed');
  });

  it('lança INVALID_TOKEN quando nenhum token ativo é encontrado', async () => {
    findActiveBySubjectAndType.mockResolvedValue(null);

    try {
      await service.validate(
        'plain',
        'subject-id',
        TokenType.EMAIL_VERIFICATION,
      );
      fail('expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(CustomHttpException);
      expect((err as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVALID_TOKEN,
      );
    }
  });

  it('lança INVALID_TOKEN quando o hash bcrypt não bate com o plain', async () => {
    findActiveBySubjectAndType.mockResolvedValue(buildTokenRecord());
    compareToken.mockResolvedValue(false);

    try {
      await service.validate(
        'wrong',
        'subject-id',
        TokenType.EMAIL_VERIFICATION,
      );
      fail('expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(CustomHttpException);
      expect((err as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVALID_TOKEN,
      );
    }
  });

  it('lança TOKEN_EXPIRED quando o token encontrado já está expirado', async () => {
    findActiveBySubjectAndType.mockResolvedValue(
      buildTokenRecord({ expiresAt: new Date(Date.now() - 60_000) }),
    );
    compareToken.mockResolvedValue(true);

    try {
      await service.validate(
        'plain',
        'subject-id',
        TokenType.EMAIL_VERIFICATION,
      );
      fail('expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(CustomHttpException);
      expect((err as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.TOKEN_EXPIRED,
      );
    }
  });

  it('lança TOKEN_ALREADY_USED quando o registro já foi consumido', async () => {
    findActiveBySubjectAndType.mockResolvedValue(
      buildTokenRecord({ used: true }),
    );
    compareToken.mockResolvedValue(true);

    try {
      await service.validate(
        'plain',
        'subject-id',
        TokenType.EMAIL_VERIFICATION,
      );
      fail('expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(CustomHttpException);
      expect((err as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.TOKEN_ALREADY_USED,
      );
    }
  });

  describe('markAsUsed', () => {
    it('delega para o repositório', async () => {
      const record = buildTokenRecord({ used: true });
      markAsUsed.mockResolvedValue(record);

      const out = await service.markAsUsed('token-id', 'user-1');
      expect(out).toBe(record);
      expect(markAsUsed).toHaveBeenCalledWith('token-id', 'user-1');
    });
  });
});
