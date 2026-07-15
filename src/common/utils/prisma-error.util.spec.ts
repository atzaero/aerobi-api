import { Prisma } from '@/generated/prisma/client';

import {
  isSerializationConflict,
  isUniqueConstraintError,
} from './prisma-error.util';

describe('prisma-error.util', () => {
  it('reconhece P2034 (conflito de serialização)', () => {
    const err = new Prisma.PrismaClientKnownRequestError('write conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });
    expect(isSerializationConflict(err)).toBe(true);
  });

  it('ignora outros códigos Prisma conhecidos', () => {
    const err = new Prisma.PrismaClientKnownRequestError('not found', {
      code: 'P2025',
      clientVersion: 'test',
    });
    expect(isSerializationConflict(err)).toBe(false);
  });

  it('ignora erros genéricos e valores não-erro', () => {
    expect(isSerializationConflict(new Error('P2034'))).toBe(false);
    expect(isSerializationConflict('P2034')).toBe(false);
    expect(isSerializationConflict(null)).toBe(false);
    expect(isSerializationConflict(undefined)).toBe(false);
  });

  describe('isUniqueConstraintError', () => {
    it('reconhece o erro real do Prisma (P2002)', () => {
      const err = new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: 'test',
      });
      expect(isUniqueConstraintError(err)).toBe(true);
    });

    it('reconhece o mock por duck-typing usado nos specs de service', () => {
      expect(isUniqueConstraintError({ code: 'P2002' })).toBe(true);
    });

    it('ignora outros códigos e valores não-erro', () => {
      expect(isUniqueConstraintError({ code: 'P2025' })).toBe(false);
      expect(isUniqueConstraintError(new Error('P2002'))).toBe(false);
      expect(isUniqueConstraintError('P2002')).toBe(false);
      expect(isUniqueConstraintError(null)).toBe(false);
      expect(isUniqueConstraintError(undefined)).toBe(false);
    });
  });
});
