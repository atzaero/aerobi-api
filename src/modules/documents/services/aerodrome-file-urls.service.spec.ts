import { DocumentType } from '@/generated/prisma/client';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { AerodromeFileUrlsService } from './aerodrome-file-urls.service';

describe('AerodromeFileUrlsService', () => {
  let service: AerodromeFileUrlsService;
  let findLatest: jest.Mock;
  let getPresignedUrl: jest.Mock;

  const aerodromeId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    findLatest = jest.fn();
    getPresignedUrl = jest.fn();
    const repo = {
      findLatestActiveByAerodromeAndTypes: findLatest,
    } as unknown as DocumentRepository;
    const storage = { getPresignedUrl } as unknown as StorageService;
    service = new AerodromeFileUrlsService(repo, storage);
  });

  it('pede só os tipos IMAGE e KML do aeródromo', async () => {
    findLatest.mockResolvedValue([]);
    await service.resolve(aerodromeId);
    expect(findLatest).toHaveBeenCalledWith(aerodromeId, [
      DocumentType.IMAGE,
      DocumentType.KML,
    ]);
  });

  it('resolve presigned de cada tipo pela storageKey do doc ativo', async () => {
    findLatest.mockResolvedValue([
      buildDocumentFixture({ type: DocumentType.IMAGE, storageKey: 'k/img' }),
      buildDocumentFixture({ type: DocumentType.KML, storageKey: 'k/kml' }),
    ]);
    getPresignedUrl.mockImplementation((key: string) =>
      Promise.resolve(`https://minio/${key}`),
    );

    const out = await service.resolve(aerodromeId);

    expect(out).toEqual({
      imgUrl: 'https://minio/k/img',
      kmlUrl: 'https://minio/k/kml',
    });
  });

  it('tipo ausente → null (sem assinar)', async () => {
    findLatest.mockResolvedValue([
      buildDocumentFixture({ type: DocumentType.IMAGE, storageKey: 'k/img' }),
    ]);
    getPresignedUrl.mockResolvedValue('https://minio/k/img');

    const out = await service.resolve(aerodromeId);

    expect(out).toEqual({ imgUrl: 'https://minio/k/img', kmlUrl: null });
    expect(getPresignedUrl).toHaveBeenCalledTimes(1);
  });

  it('best-effort: falha ao assinar não derruba (→ null)', async () => {
    findLatest.mockResolvedValue([
      buildDocumentFixture({ type: DocumentType.IMAGE, storageKey: 'k/img' }),
      buildDocumentFixture({ type: DocumentType.KML, storageKey: 'k/kml' }),
    ]);
    getPresignedUrl.mockRejectedValue(new Error('MinIO indisponível'));

    const out = await service.resolve(aerodromeId);

    expect(out).toEqual({ imgUrl: null, kmlUrl: null });
  });

  it('best-effort: falha na query a documents degrada para null/null (não propaga)', async () => {
    findLatest.mockRejectedValue(new Error('Postgres indisponível'));

    await expect(service.resolve(aerodromeId)).resolves.toEqual({
      imgUrl: null,
      kmlUrl: null,
    });
    expect(getPresignedUrl).not.toHaveBeenCalled();
  });
});
