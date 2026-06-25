import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { getErrorMessage } from '@/common/utils/error.util';

import { StorageProvider } from '../interfaces';

/** Validade padrão de uma presigned URL (1 hora). */
const PRESIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Provedor de object storage sobre a API S3 do MinIO (`@aws-sdk/client-s3`).
 *
 * Opera sempre com a **key** do objeto (nunca com URLs): o que se persiste é a
 * key, e a presigned URL é derivada sob demanda. Usa dois clientes: um com o
 * endpoint **interno** (`MINIO_ENDPOINT`, rede Docker) para upload/delete/
 * download, e — quando configurado — outro com o endpoint **público**
 * (`MINIO_PUBLIC_ENDPOINT`) usado apenas para assinar as presigned URLs,
 * garantindo que a assinatura case com o host que o navegador acessa.
 */
@Injectable()
export class MinioStorageProvider implements StorageProvider {
  private readonly logger = new Logger(MinioStorageProvider.name);
  // Clientes criados lazy (no primeiro uso), não no boot — ver assertConfigured.
  private s3ClientInstance: S3Client | null = null;
  private s3PublicClientInstance: S3Client | null = null;
  private readonly environment: string;
  private readonly config: {
    endpoint: string;
    publicEndpoint: string | null;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly errorMessageService: ErrorMessageService,
  ) {
    this.environment = this.configService.get<string>(
      'NODE_ENV',
      'development',
    );

    this.config = {
      endpoint: this.configService.get<string>('MINIO_ENDPOINT') ?? '',
      publicEndpoint:
        this.configService.get<string>('MINIO_PUBLIC_ENDPOINT') ?? null,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') ?? '',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') ?? '',
      bucket:
        this.configService.get<string>('MINIO_BUCKET_READINGS') ??
        'aerobi-dev-readings',
      region: this.configService.get<string>('MINIO_REGION') ?? 'sa-east-1',
    };

    this.logger.log(
      `MinIO provider registrado (env=${this.environment}, bucket=${this.config.bucket}).`,
    );
  }

  private buildClient(endpoint: string): S3Client {
    return new S3Client({
      endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Valida a config obrigatória do MinIO no PRIMEIRO uso (lazy), não no boot —
   * assim a ausência de config degrada apenas os endpoints de storage em vez de
   * impedir a aplicação inteira de subir. O erro é re-embrulhado pelo `fail()`
   * de cada operação com o `ErrorCode` correspondente.
   */
  private assertConfigured(): void {
    if (
      !this.config.endpoint ||
      !this.config.accessKey ||
      !this.config.secretKey
    ) {
      throw new Error(
        'Configuração do MinIO ausente (defina MINIO_ENDPOINT, MINIO_ACCESS_KEY e MINIO_SECRET_KEY).',
      );
    }
  }

  /** Cliente interno (lazy) para upload/delete/download. */
  private get internalClient(): S3Client {
    this.assertConfigured();
    this.s3ClientInstance ??= this.buildClient(this.config.endpoint);
    return this.s3ClientInstance;
  }

  /**
   * Cliente para assinar presigned URLs: usa o endpoint público quando
   * configurado (hostname acessível ao navegador); senão, cai para o interno.
   */
  private get signingClient(): S3Client {
    this.assertConfigured();
    if (!this.config.publicEndpoint) {
      return this.internalClient;
    }
    this.s3PublicClientInstance ??= this.buildClient(
      this.config.publicEndpoint,
    );
    return this.s3PublicClientInstance;
  }

  private assertKey(key: string): void {
    if (!key || key.trim().length === 0) {
      throw new Error('A key do objeto não pode ser vazia.');
    }
  }

  private fail(
    err: unknown,
    code:
      | ErrorCode.STORAGE_UPLOAD_FAILED
      | ErrorCode.STORAGE_DELETE_FAILED
      | ErrorCode.STORAGE_GET_PRESIGNED_URL_FAILED
      | ErrorCode.STORAGE_DOWNLOAD_FAILED,
    context: string,
  ): never {
    const message = getErrorMessage(err);
    this.logger.error(`${context}: ${message}`);
    throw new CustomHttpException(
      this.errorMessageService.getMessage(code, { ERROR_MESSAGE: message }),
      HttpStatus.INTERNAL_SERVER_ERROR,
      code,
    );
  }

  async upload(file: Express.Multer.File, key: string): Promise<void> {
    this.assertKey(key);
    try {
      await this.internalClient.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (err) {
      this.fail(
        err,
        ErrorCode.STORAGE_UPLOAD_FAILED,
        'Falha ao enviar arquivo para o MinIO',
      );
    }
  }

  async getPresignedUrl(key: string): Promise<string> {
    this.assertKey(key);
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });
      // Assina com o cliente público quando disponível (hostname acessível ao
      // navegador); senão, cai para o cliente interno.
      const client = this.signingClient;
      return await getSignedUrl(client, command, {
        expiresIn: PRESIGNED_URL_TTL_SECONDS,
      });
    } catch (err) {
      this.fail(
        err,
        ErrorCode.STORAGE_GET_PRESIGNED_URL_FAILED,
        'Falha ao gerar presigned URL',
      );
    }
  }

  async delete(key: string): Promise<void> {
    this.assertKey(key);
    try {
      await this.internalClient.send(
        new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
    } catch (err) {
      this.fail(
        err,
        ErrorCode.STORAGE_DELETE_FAILED,
        'Falha ao remover arquivo do MinIO',
      );
    }
  }

  async download(key: string): Promise<Buffer> {
    this.assertKey(key);
    try {
      const response = await this.internalClient.send(
        new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
      if (!response.Body) {
        throw new Error('Objeto não encontrado ou vazio.');
      }
      const bytes = await response.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (err) {
      this.fail(
        err,
        ErrorCode.STORAGE_DOWNLOAD_FAILED,
        'Falha ao baixar arquivo do MinIO',
      );
    }
  }

  /**
   * Configura CORS no bucket para permitir leitura das presigned URLs pelo
   * navegador (fetch/XHR cross-origin). Não lança em caso de falha — apenas
   * loga, para não derrubar a aplicação.
   */
  async configureBucketCors(allowedOrigins: string[] = []): Promise<void> {
    try {
      const origins =
        allowedOrigins.length > 0
          ? allowedOrigins
          : ['http://localhost:3000', 'http://localhost:3001'];

      await this.internalClient.send(
        new PutBucketCorsCommand({
          Bucket: this.config.bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
                AllowedOrigins: origins,
                ExposeHeaders: ['ETag', 'Content-Length'],
                MaxAgeSeconds: 3600,
              },
            ],
          },
        }),
      );

      this.logger.log(
        `CORS configurado no bucket ${this.config.bucket} para: ${origins.join(', ')}`,
      );
    } catch (err) {
      const message = getErrorMessage(err);
      this.logger.warn(
        `Falha ao configurar CORS no bucket ${this.config.bucket}: ${message}. ` +
          'Configure manualmente via console do MinIO se necessário.',
      );
    }
  }
}
