/**
 * Contrato de um provedor de object storage. Opera sempre com a **key** do
 * objeto (ex. `movements/{movementId}/image/<uuid>.jpg`) — a key é montada pela
 * gramática canônica em `../keys` (`buildStorageKey`), não pelo storage.
 *
 * Hoje implementado por `MinioStorageProvider`; novos provedores (S3, GCS, …)
 * podem ser adicionados via `StorageProviderFactory` sem alterar os consumidores.
 */
export interface StorageProvider {
  /** Envia o conteúdo de `file` para a `key` informada. */
  upload(file: Express.Multer.File, key: string): Promise<void>;

  /** Remove o objeto identificado por `key`. */
  delete(key: string): Promise<void>;

  /** Gera uma presigned URL temporária para leitura do objeto. */
  getPresignedUrl(key: string): Promise<string>;

  /** Baixa o conteúdo do objeto como Buffer. */
  download(key: string): Promise<Buffer>;
}
