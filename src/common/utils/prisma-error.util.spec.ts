import { Prisma } from '@/generated/prisma/client';

import { isSerializationConflict } from './prisma-error.util';

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
});
