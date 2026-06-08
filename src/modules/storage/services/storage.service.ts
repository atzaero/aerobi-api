import { Injectable } from '@nestjs/common';

import { StorageProviderFactory } from '../factories/storage-provider.factory';
import { StorageProvider, UploadedFile } from '../interfaces';

/**
 * Fachada de armazenamento de objetos. Delega ao `StorageProvider` ativo
 * (resolvido pela `StorageProviderFactory`), isolando os consumidores do
 * backend concreto (MinIO/S3).
 */
@Injectable()
export class StorageService {
  private readonly provider: StorageProvider;

  constructor(storageProviderFactory: StorageProviderFactory) {
    this.provider = storageProviderFactory.createStorageProvider();
  }

  /** Envia um arquivo para `<path>/<file.originalname>` e retorna a URL canônica. */
  async upload(
    file: Express.Multer.File,
    path: string,
    options?: Record<string, unknown>,
  ): Promise<UploadedFile> {
    return this.provider.upload(file, path, options);
  }

  /** Remove um objeto (aceita key direta ou URL canônica). */
  async delete(path: string): Promise<void> {
    return this.provider.delete(path);
  }

  /** Gera uma presigned URL temporária para leitura do objeto. */
  async getPresignedUrl(path: string): Promise<string> {
    return this.provider.getPresignedUrl(path);
  }

  /** Baixa o conteúdo do objeto como Buffer. */
  async download(path: string): Promise<Buffer> {
    return this.provider.download(path);
  }

  /**
   * Configura CORS no bucket — disponível apenas para provedores que suportam
   * (ex. MinIO). Útil quando o frontend acessa as presigned URLs via fetch/XHR.
   */
  async configureBucketCors(allowedOrigins?: string[]): Promise<void> {
    if (this.provider.configureBucketCors) {
      return this.provider.configureBucketCors(allowedOrigins);
    }
    throw new Error(
      'CORS configuration is not supported by this storage provider',
    );
  }
}
