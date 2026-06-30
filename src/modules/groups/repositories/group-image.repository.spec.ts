import { Prisma } from '@/generated/prisma/client';
import type { PrismaService } from '@/prisma/prisma.service';

import { buildGroupFixture } from '../testing/group.entity.fixture';

import type { CreateGroupImageInput } from './group-image.repository.interface';

import { GroupImageRepository } from './group-image.repository';

function p2034(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('write conflict', {
    code: 'P2034',
    clientVersion: 'test',
  });
}

const input: CreateGroupImageInput = {
  groupId: 'g1',
  imageKey: 'groups/g1/images/x.png',
  originalFilename: 'x.png',
  mimeType: 'image/png',
  sizeBytes: 10,
  actorId: 'actor-1',
};

describe('GroupImageRepository.createActiveImage (retry P2034)', () => {
  let transaction: jest.Mock;
  let repo: GroupImageRepository;

  beforeEach(() => {
    jest.useFakeTimers();
    transaction = jest.fn();
    repo = new GroupImageRepository({
      $transaction: transaction,
    } as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retenta e conclui devolvendo o grupo quando o conflito some antes do limite', async () => {
    const group = buildGroupFixture({
      id: input.groupId,
      imageKey: input.imageKey,
    });
    transaction
      .mockRejectedValueOnce(p2034())
      .mockRejectedValueOnce(p2034())
      .mockResolvedValueOnce(group);
    /** Anexa o matcher antes de avançar os timers (evita unhandled rejection). */
    const expectation = expect(repo.createActiveImage(input)).resolves.toBe(
      group,
    );
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
