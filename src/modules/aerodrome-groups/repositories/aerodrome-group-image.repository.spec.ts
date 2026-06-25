import { Prisma } from '@/generated/prisma/client';
import type { PrismaService } from '@/prisma/prisma.service';

import type { CreateAerodromeGroupImageInput } from './aerodrome-group-image.repository.interface';

import { AerodromeGroupImageRepository } from './aerodrome-group-image.repository';

function p2034(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('write conflict', {
    code: 'P2034',
    clientVersion: 'test',
  });
}

const input: CreateAerodromeGroupImageInput = {
  groupId: 'g1',
  imageKey: 'groups/g1/images/x.png',
  originalFilename: 'x.png',
  mimeType: 'image/png',
  sizeBytes: 10,
  actorId: 'actor-1',
};

describe('AerodromeGroupImageRepository.createActiveImage (retry P2034)', () => {
  let transaction: jest.Mock;
  let repo: AerodromeGroupImageRepository;

  beforeEach(() => {
    jest.useFakeTimers();
    transaction = jest.fn();
    repo = new AerodromeGroupImageRepository({
      $transaction: transaction,
    } as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retenta e conclui quando o conflito some antes do limite', async () => {
    transaction
      .mockRejectedValueOnce(p2034())
      .mockRejectedValueOnce(p2034())
      .mockResolvedValueOnce(undefined);
    /** Anexa o matcher antes de avançar os timers (evita unhandled rejection). */
    const expectation = expect(
      repo.createActiveImage(input),
    ).resolves.toBeUndefined();
    await jest.runAllTimersAsync();
    await expectation;
    expect(transaction).toHaveBeenCalledTimes(3);
  });

  it('propaga P2034 após esgotar as tentativas (3x)', async () => {
    const err = p2034();
    transaction.mockRejectedValue(err);
    const expectation = expect(repo.createActiveImage(input)).rejects.toBe(err);
    await jest.runAllTimersAsync();
    await expectation;
    expect(transaction).toHaveBeenCalledTimes(3);
  });

  it('não retenta erros que não são conflito de serialização', async () => {
    const other = new Prisma.PrismaClientKnownRequestError('not found', {
      code: 'P2025',
      clientVersion: 'test',
    });
    transaction.mockRejectedValue(other);
    await expect(repo.createActiveImage(input)).rejects.toBe(other);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
