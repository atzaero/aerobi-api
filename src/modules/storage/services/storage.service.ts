import { Injectable } from '@nestjs/common';

import { StorageProviderFactory } from '../factories/storage-provider.factory';
import { StorageProvider } from '../interfaces';

/**
 * Fachada de armazenamento de objetos. Delega ao `StorageProvider` ativo
 * (resolvido pela `StorageProviderFactory`), isolando os consumidores do
 * backend concreto (MinIO/S3). Opera sempre com a **key** do objeto.
 */
@Injectable()
export class StorageService {
  private readonly provider: StorageProvider;

  constructor(storageProviderFactory: StorageProviderFactory) {
    this.provider = storageProviderFactory.createStorageProvider();
  }

  /** Envia o conteúdo de `file` para a `key` informada. */
  async upload(file: Express.Multer.File, key: string): Promise<void> {
    return this.provider.upload(file, key);
  }

  /** Remove o objeto identificado por `key`. */
  async delete(key: string): Promise<void> {
    return this.provider.delete(key);
  }

  /** Gera uma presigned URL temporária para leitura do objeto. */
  async getPresignedUrl(key: string): Promise<string> {
    return this.provider.getPresignedUrl(key);
  }

  /** Baixa o conteúdo do objeto como Buffer. */
  async download(key: string): Promise<Buffer> {
    return this.provider.download(key);
  }
}
