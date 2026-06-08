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

import { StorageProvider, UploadedFile } from '../interfaces';

/** Validade padrão de uma presigned URL (1 hora). */
const PRESIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Provedor de object storage sobre a API S3 do MinIO (`@aws-sdk/client-s3`).
 *
 * Usa dois clientes: um com o endpoint **interno** (`MINIO_ENDPOINT`, rede
 * Docker) para upload/delete/download, e — quando configurado — outro com o
 * endpoint **público** (`MINIO_PUBLIC_ENDPOINT`) usado apenas para assinar as
 * presigned URLs, garantindo que a assinatura case com o host que o navegador
 * acessa.
 */
@Injectable()
export class MinioStorageProvider implements StorageProvider {
  private readonly logger = new Logger(MinioStorageProvider.name);
  private readonly s3Client: S3Client;
  private readonly s3PublicClient: S3Client | null;
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
        this.configService.get<string>('MINIO_BUCKET_AVIASCAN') ??
        'aerobi-dev-aviascan',
      region: this.configService.get<string>('MINIO_REGION') ?? 'sa-east-1',
    };

    if (
      !this.config.endpoint ||
      !this.config.accessKey ||
      !this.config.secretKey
    ) {
      this.logger.error(
        'Configuração do MinIO incompleta. Verifique MINIO_ENDPOINT, MINIO_ACCESS_KEY e MINIO_SECRET_KEY.',
      );
      throw new Error('MinIO configuration is incomplete');
    }

    this.s3Client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: true,
    });

    // Cliente dedicado ao endpoint público: as presigned URLs são assinadas com
    // o hostname que o cliente final consegue acessar (ex. s3.aerobi.com.br).
    this.s3PublicClient = this.config.publicEndpoint
      ? new S3Client({
          endpoint: this.config.publicEndpoint,
          region: this.config.region,
          credentials: {
            accessKeyId: this.config.accessKey,
            secretAccessKey: this.config.secretKey,
          },
          forcePathStyle: true,
        })
      : null;

    this.logger.log(
      `MinIO configurado (env=${this.environment}, bucket=${this.config.bucket}` +
        `${this.config.publicEndpoint ? `, publicEndpoint=${this.config.publicEndpoint}` : ''})`,
    );
  }

  /**
   * Extrai a key do objeto a partir de uma URL canônica ou de um path direto.
   * Robusto a endpoint interno vs público e à presença/ausência do bucket.
   */
  private extractPathFromUrl(url: string): string {
    const bucket = this.config.bucket;
    let path = url.split('?')[0].split('#')[0];

    if (path.includes(`${this.config.endpoint}/${bucket}/`)) {
      path = path.replace(`${this.config.endpoint}/${bucket}/`, '');
    } else if (
      this.config.publicEndpoint &&
      path.includes(`${this.config.publicEndpoint}/${bucket}/`)
    ) {
      path = path.replace(`${this.config.publicEndpoint}/${bucket}/`, '');
    } else {
      const bucketPattern = `/${bucket}/`;
      const bucketIndex = path.indexOf(bucketPattern);
      if (bucketIndex !== -1) {
        path = path.substring(bucketIndex + bucketPattern.length);
      } else {
        try {
          const pathParts = new URL(path).pathname.split('/').filter(Boolean);
          path =
            pathParts[0] === bucket && pathParts.length > 1
              ? pathParts.slice(1).join('/')
              : pathParts.join('/');
        } catch {
          if (path.startsWith(`${bucket}/`)) {
            path = path.substring(bucket.length + 1);
          } else if (path.includes(`/${bucket}/`)) {
            path = path.split(`/${bucket}/`)[1] || path;
          }
        }
      }
    }

    path = decodeURIComponent(path).trim();

    if (!path) {
      throw new Error(`Não foi possível extrair a key da URL: ${url}`);
    }

    return path;
  }

  /** Detecta se o argumento é uma URL canônica (vs uma key direta). */
  private isCanonicalUrl(path: string): boolean {
    return (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.includes(`${this.config.bucket}/`)
    );
  }

  /** Resolve a key a partir de uma URL canônica ou de uma key já direta. */
  private resolveKey(path: string): string {
    const key = this.isCanonicalUrl(path)
      ? this.extractPathFromUrl(path)
      : path;
    if (!key || key.trim().length === 0) {
      throw new Error(`Key inválida extraída de: "${path}".`);
    }
    return key;
  }

  async upload(file: Express.Multer.File, path: string): Promise<UploadedFile> {
    try {
      const key = `${path}/${file.originalname}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        url: `${this.config.endpoint}/${this.config.bucket}/${key}`,
        type: file.mimetype,
        name: key,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Falha ao enviar arquivo para o MinIO: ${message}`);
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.STORAGE_UPLOAD_FAILED, {
          ERROR_MESSAGE: message,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.STORAGE_UPLOAD_FAILED,
      );
    }
  }

  async getPresignedUrl(path: string): Promise<string> {
    try {
      const key = this.resolveKey(path);
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });
      // Assina com o cliente público quando disponível (hostname acessível ao
      // navegador); senão, cai para o cliente interno.
      const client = this.s3PublicClient ?? this.s3Client;
      return await getSignedUrl(client, command, {
        expiresIn: PRESIGNED_URL_TTL_SECONDS,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Falha ao gerar presigned URL: ${message}`);
      throw new CustomHttpException(
        this.errorMessageService.getMessage(
          ErrorCode.STORAGE_GET_PRESIGNED_URL_FAILED,
          { ERROR_MESSAGE: message },
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.STORAGE_GET_PRESIGNED_URL_FAILED,
      );
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const key = this.resolveKey(path);
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Falha ao remover arquivo do MinIO: ${message}`);
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.STORAGE_DELETE_FAILED, {
          ERROR_MESSAGE: message,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.STORAGE_DELETE_FAILED,
      );
    }
  }

  async download(path: string): Promise<Buffer> {
    try {
      const key = this.resolveKey(path);
      const response = await this.s3Client.send(
        new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
      if (!response.Body) {
        throw new Error('Objeto não encontrado ou vazio.');
      }
      const bytes = await response.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Falha ao baixar arquivo do MinIO: ${message}`);
      throw new CustomHttpException(
        this.errorMessageService.getMessage(
          ErrorCode.STORAGE_GET_PRESIGNED_URL_FAILED,
          { ERROR_MESSAGE: message },
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.STORAGE_GET_PRESIGNED_URL_FAILED,
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

      await this.s3Client.send(
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
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Falha ao configurar CORS no bucket ${this.config.bucket}: ${message}. ` +
          'Configure manualmente via console do MinIO se necessário.',
      );
    }
  }
}
