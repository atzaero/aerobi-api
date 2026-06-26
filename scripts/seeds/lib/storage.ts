/**
 * Cliente de object storage leve para os seeds. Fala direto com a API S3 do
 * MinIO (`@aws-sdk/client-s3`, dependency de produção), espelhando exatamente a
 * configuração do `MinioStorageProvider` — mesmo endpoint interno, region,
 * credenciais e bucket — para que a presigned URL resolvida pela aplicação
 * depois aponte para o objeto certo. Não sobe o contexto Nest (evita crons e
 * `onModuleInit`); reusa apenas as envs `MINIO_*`.
 */
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

/** Bucket default — idêntico ao fallback do `MinioStorageProvider`. */
const DEFAULT_BUCKET = 'aerobi-dev-readings';

/** Region default — idêntica ao fallback do `MinioStorageProvider`. */
const DEFAULT_REGION = 'sa-east-1';

/**
 * Storage mínimo usado pelo seed: operações de `putObject`/`deleteObject` sobre
 * a key do objeto.
 */
export type SeedStorage = {
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  deleteObject(key: string): Promise<void>;
};

/**
 * Constrói o `SeedStorage` a partir das envs `MINIO_*`. Lança se endpoint ou
 * credenciais faltarem (fail-fast), já que sem eles não há como subir as
 * bandeiras e o erro só apareceria no primeiro `putObject`.
 */
export function buildSeedStorage(env: NodeJS.ProcessEnv): SeedStorage {
  const endpoint = env.MINIO_ENDPOINT?.trim();
  const accessKey = env.MINIO_ACCESS_KEY?.trim();
  const secretKey = env.MINIO_SECRET_KEY?.trim();

  const missing = [
    ['MINIO_ENDPOINT', endpoint],
    ['MINIO_ACCESS_KEY', accessKey],
    ['MINIO_SECRET_KEY', secretKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `[seed:states] ${missing.join(', ')} ausente(s) — necessário(s) para o upload das bandeiras.`,
    );
  }

  const bucket = env.MINIO_BUCKET_READINGS?.trim() || DEFAULT_BUCKET;

  const client = new S3Client({
    endpoint,
    region: env.MINIO_REGION?.trim() || DEFAULT_REGION,
    credentials: {
      accessKeyId: accessKey as string,
      secretAccessKey: secretKey as string,
    },
    forcePathStyle: true,
  });

  return {
    async putObject(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    },
    async deleteObject(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
  };
}
