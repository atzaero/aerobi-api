/**
 * Arquivo enviado ao object storage, com a URL canônica (interna) do objeto.
 * A URL pública/temporária para consumo é obtida via `getPresignedUrl`.
 */
export interface UploadedFile {
  /** URL canônica do objeto (`<endpoint>/<bucket>/<key>`). */
  url: string;
  /** Nome (key final) do objeto. */
  name: string;
  /** Content-Type do objeto. */
  type: string;
}

/**
 * Contrato de um provedor de object storage. Hoje implementado por
 * `MinioStorageProvider`; novos provedores (S3, GCS, …) podem ser adicionados
 * via `StorageProviderFactory` sem alterar os consumidores.
 */
export interface StorageProvider {
  upload(
    file: Express.Multer.File,
    path: string,
    options?: Record<string, unknown>,
  ): Promise<UploadedFile>;

  delete(path: string): Promise<void>;

  getPresignedUrl(path: string): Promise<string>;

  download(path: string): Promise<Buffer>;

  configureBucketCors?(allowedOrigins?: string[]): Promise<void>;
}
