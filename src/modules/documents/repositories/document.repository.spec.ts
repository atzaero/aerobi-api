import { DocumentType } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { DocumentRepository } from './document.repository';

describe('DocumentRepository', () => {
  let repository: DocumentRepository;
  let findMany: jest.Mock;

  const aerodromeId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    findMany = jest.fn();
    const prisma = {
      document: { findMany },
    } as unknown as PrismaService;
    repository = new DocumentRepository(prisma);
  });

  it('findLatestActiveByAerodromeAndTypes: distinct por tipo, só ativos, mais recente primeiro', async () => {
    const docs = [buildDocumentFixture({ type: DocumentType.IMAGE })];
    findMany.mockResolvedValue(docs);

    await expect(
      repository.findLatestActiveByAerodromeAndTypes(aerodromeId, [
        DocumentType.IMAGE,
        DocumentType.KML,
      ]),
    ).resolves.toBe(docs);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        aerodromeId,
        type: { in: [DocumentType.IMAGE, DocumentType.KML] },
        deletedAt: null,
      },
      distinct: ['type'],
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  });
});
