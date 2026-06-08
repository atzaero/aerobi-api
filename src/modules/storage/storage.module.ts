import { Module } from '@nestjs/common';

import { StorageProviderFactory } from './factories/storage-provider.factory';
import { MinioStorageProvider } from './providers/minio-storage.provider';
import { StorageService } from './services/storage.service';

/**
 * Módulo de object storage (MinIO/S3). Exporta o `StorageService` para os
 * módulos consumidores (ex. `readings`).
 *
 * `ConfigModule` (global) e `ErrorMessageModule` (`@Global`) já estão
 * disponíveis na aplicação — não é necessário importá-los aqui.
 */
@Module({
  providers: [StorageService, StorageProviderFactory, MinioStorageProvider],
  exports: [StorageService],
})
export class StorageModule {}
