import type { StorageProviderFactory } from '../factories/storage-provider.factory';
import type { StorageProvider, UploadedFile } from '../interfaces';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let upload: jest.Mock;
  let remove: jest.Mock;
  let getPresignedUrl: jest.Mock;
  let download: jest.Mock;
  let configureBucketCors: jest.Mock;

  const file = {
    originalname: 'a1b2.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('x'),
  } as Express.Multer.File;

  function buildService(provider: Partial<StorageProvider>): StorageService {
    const factory = {
      createStorageProvider: () => provider as StorageProvider,
    } as unknown as StorageProviderFactory;
    return new StorageService(factory);
  }

  beforeEach(() => {
    upload = jest.fn();
    remove = jest.fn();
    getPresignedUrl = jest.fn();
    download = jest.fn();
    configureBucketCors = jest.fn();
    service = buildService({
      upload,
      delete: remove,
      getPresignedUrl,
      download,
      configureBucketCors,
    });
  });

  it('delega upload ao provider ativo', async () => {
    const uploaded: UploadedFile = {
      url: 'http://minio:9000/aerobi-dev-aviascan/readings/2026/06/a1b2.jpg',
      name: 'readings/2026/06/a1b2.jpg',
      type: 'image/jpeg',
    };
    upload.mockResolvedValue(uploaded);

    await expect(service.upload(file, 'readings/2026/06')).resolves.toEqual(
      uploaded,
    );
    expect(upload).toHaveBeenCalledWith(file, 'readings/2026/06', undefined);
  });

  it('delega getPresignedUrl ao provider ativo', async () => {
    getPresignedUrl.mockResolvedValue('https://signed/url');

    await expect(service.getPresignedUrl('readings/k.jpg')).resolves.toBe(
      'https://signed/url',
    );
    expect(getPresignedUrl).toHaveBeenCalledWith('readings/k.jpg');
  });

  it('delega delete ao provider ativo', async () => {
    remove.mockResolvedValue(undefined);

    await service.delete('readings/k.jpg');
    expect(remove).toHaveBeenCalledWith('readings/k.jpg');
  });

  it('delega download ao provider ativo', async () => {
    const buffer = Buffer.from('img');
    download.mockResolvedValue(buffer);

    await expect(service.download('readings/k.jpg')).resolves.toBe(buffer);
    expect(download).toHaveBeenCalledWith('readings/k.jpg');
  });

  it('delega configureBucketCors quando suportado', async () => {
    configureBucketCors.mockResolvedValue(undefined);

    await service.configureBucketCors(['http://localhost:3000']);
    expect(configureBucketCors).toHaveBeenCalledWith(['http://localhost:3000']);
  });

  it('lança quando o provider não suporta CORS', async () => {
    const svcNoCors = buildService({
      upload,
      delete: remove,
      getPresignedUrl,
      download,
    });

    await expect(svcNoCors.configureBucketCors()).rejects.toThrow(
      'CORS configuration is not supported',
    );
  });
});
