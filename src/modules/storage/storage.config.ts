/**
 * Configuração de storage compartilhada entre o `MinioStorageProvider` (dentro
 * do Nest) e os seeds (cliente S3 leve, fora do Nest). **Puro/framework-free** —
 * fonte única dos defaults e da resolução do bucket/region, para não duplicar as
 * strings nem a resolução em dois lugares.
 */

/** Bucket único por app/ambiente (default de dev). */
export const DEFAULT_STORAGE_BUCKET = 'aerobi-dev';

/** Region default do MinIO/S3. */
export const DEFAULT_STORAGE_REGION = 'sa-east-1';

/** Leitor de variável de ambiente agnóstico (`ConfigService.get` ou `process.env`). */
export type EnvGetter = (key: string) => string | undefined;

/** Resolve o bucket único: `MINIO_BUCKET` (canônico) → `aerobi-dev` (default). */
export function resolveStorageBucket(get: EnvGetter): string {
  return get('MINIO_BUCKET')?.trim() || DEFAULT_STORAGE_BUCKET;
}

/** Resolve a region: `MINIO_REGION` → `sa-east-1`. */
export function resolveStorageRegion(get: EnvGetter): string {
  return get('MINIO_REGION')?.trim() || DEFAULT_STORAGE_REGION;
}
