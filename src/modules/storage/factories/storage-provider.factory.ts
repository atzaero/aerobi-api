import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StorageProvider } from '../interfaces';
import { MinioStorageProvider } from '../providers/minio-storage.provider';

/**
 * Resolve o `StorageProvider` ativo a partir de `STORAGE_PROVIDER` (default
 * `minio`). Centraliza a escolha do provedor para que novos backends de
 * storage sejam plugáveis sem tocar nos consumidores.
 */
@Injectable()
export class StorageProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly minioStorageProvider: MinioStorageProvider,
  ) {}

  createStorageProvider(): StorageProvider {
    const provider = this.configService.get<string>(
      'STORAGE_PROVIDER',
      'minio',
    );

    switch (provider) {
      case 'minio':
      default:
        return this.minioStorageProvider;
    }
  }
}
