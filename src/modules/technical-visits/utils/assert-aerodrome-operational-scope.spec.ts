import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import type { UserGroupScope } from '@/common/utils/group-scope.util';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { PrismaService } from '@/prisma/prisma.service';

import { assertAerodromeOperationalScope } from './assert-aerodrome-operational-scope';

describe('assertAerodromeOperationalScope', () => {
  const aerodromeId = '22222222-2222-4222-8222-222222222222';
  const aerodrome = {
    id: aerodromeId,
    groupId: 'g1',
    group: { uf: 'GO' },
  };

  let findFirst: jest.Mock;
  let prisma: PrismaService;
  let errors: ErrorMessageService;

  beforeEach(() => {
    findFirst = jest.fn();
    prisma = {
      aerodrome: { findFirst },
    } as unknown as PrismaService;
    errors = { getMessage: jest.fn() } as unknown as ErrorMessageService;
  });

  it('404 quando aeródromo não existe', async () => {
    findFirst.mockResolvedValue(null);
    await expect(
      assertAerodromeOperationalScope(prisma, errors, aerodromeId, {
        kind: 'all',
      }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('404 quando scope é none (sem grupo provisionado)', async () => {
    findFirst.mockResolvedValue(aerodrome);
    await expect(
      assertAerodromeOperationalScope(prisma, errors, aerodromeId, {
        kind: 'none',
      }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('404 quando aeródromo está fora do grupo do ator', async () => {
    findFirst.mockResolvedValue(aerodrome);
    await expect(
      assertAerodromeOperationalScope(prisma, errors, aerodromeId, {
        kind: 'group',
        groupId: 'other',
      }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('retorna aeródromo quando escopo all', async () => {
    findFirst.mockResolvedValue(aerodrome);
    await expect(
      assertAerodromeOperationalScope(prisma, errors, aerodromeId, {
        kind: 'all',
      } satisfies UserGroupScope),
    ).resolves.toBe(aerodrome);
  });

  it('retorna aeródromo quando grupo coincide', async () => {
    findFirst.mockResolvedValue(aerodrome);
    await expect(
      assertAerodromeOperationalScope(prisma, errors, aerodromeId, {
        kind: 'group',
        groupId: 'g1',
      }),
    ).resolves.toBe(aerodrome);
  });
});
