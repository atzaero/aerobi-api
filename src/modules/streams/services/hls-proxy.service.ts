import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type AxiosResponse, isAxiosError } from 'axios';
import type { Response } from 'express';
import type { Readable } from 'node:stream';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { Camera } from '../types/camera';
import { parsePositiveInt } from '../utils/parse-positive-int';

import { CameraResolverService } from './camera-resolver.service';

/** Timeout padrão (ms) para a chamada HTTP ao mediamtx. */
const DEFAULT_TIMEOUT_MS = 10_000;
/** Porta padrão do servidor HLS do mediamtx. */
const DEFAULT_HLS_PORT = 8888;

interface ContentHeaders {
  contentType: string;
  cacheControl: string;
}

/**
 * Faz **proxy passthrough** do HLS servido pelo mediamtx no Raspi (acessível só
 * via tailnet) — sem transcoding, apenas pipe de bytes.
 *
 * Fluxo de `proxyHls`:
 * 1. Resolve a câmera no Firestore (cacheada via {@link CameraResolverService}).
 * 2. Monta `http://{mediamtxNode}:{porta}/{mediamtxPath}/{path}`.
 * 3. `GET` em streaming via tailnet e repassa os bytes direto pro `Response`.
 *
 * Erros: câmera inexistente/desativada/offline → **404**; mediamtx fora/timeout
 * → **502**. O backend não detém credencial da câmera — o mediamtx já entrega o
 * HLS pronto.
 */
@Injectable()
export class HlsProxyService {
  private readonly logger = new Logger(HlsProxyService.name);
  private readonly timeoutMs: number;
  private readonly hlsPort: number;

  constructor(
    private readonly http: HttpService,
    private readonly resolver: CameraResolverService,
    private readonly errorMessage: ErrorMessageService,
    config: ConfigService,
  ) {
    this.timeoutMs = parsePositiveInt(
      config.get<string | number>('STREAMS_PROXY_TIMEOUT_MS'),
      DEFAULT_TIMEOUT_MS,
    );
    this.hlsPort = parsePositiveInt(
      config.get<string | number>('STREAMS_MEDIAMTX_HLS_PORT'),
      DEFAULT_HLS_PORT,
    );
  }

  /**
   * Resolve a câmera, busca `path` no mediamtx e faz pipe da resposta em `res`.
   * `path` é a playlist (`index.m3u8`), uma variante (`*.m3u8`) ou um segmento
   * (`*.m4s`/`*.mp4`), já validado na rota. `search` é a query string original
   * (ex.: `?_HLS_msn=…&_HLS_part=…`), repassada **verbatim** ao mediamtx — é o
   * que faz o *blocking reload* do LL-HLS funcionar (o mediamtx segura a resposta
   * até o segmento/parte existir, evitando o churn de 404 na borda do ao vivo).
   * Lança {@link CustomHttpException} antes de qualquer byte ser escrito
   * (404/502); falha já no meio do stream apenas destrói o `res`.
   */
  async proxyHls(
    cameraId: string,
    path: string,
    res: Response,
    search = '',
  ): Promise<void> {
    /**
     * Erro ao resolver no Firestore (conectividade/credenciais) é uma falha de
     * serviço externo → 502, não 500. Câmera inexistente/desativada (resolve
     * devolve null/enabled=false) continua a ser 404.
     */
    let camera: Camera | null;
    try {
      camera = await this.resolver.resolve(cameraId);
    } catch (error) {
      throw this.badGateway('Firestore', error);
    }
    if (!camera || !camera.enabled) {
      throw this.notFound(cameraId);
    }

    const url = `http://${camera.mediamtxNode}:${this.hlsPort}/${camera.mediamtxPath}/${path}${search}`;

    let upstream: AxiosResponse<Readable>;
    try {
      upstream = await this.http.axiosRef.get<Readable>(url, {
        responseType: 'stream',
        timeout: this.timeoutMs,
        validateStatus: () => true,
      });
    } catch (error) {
      throw this.badGateway('mediamtx', error);
    }

    /**
     * Crash safety: a resposta axios em streaming pode emitir `'error'` de forma
     * assíncrona (socket reset, premature close quando o player aborta um
     * segmento). Sem listener, o Node derruba o processo com
     * "Unhandled 'error' event". Anexamos ANTES de qualquer `destroy()`/`pipe`.
     * Aborts de player são normais → log em debug; só destruímos o `res` se já
     * começámos a enviar bytes (caso contrário deixamos o filtro responder).
     */
    upstream.data.on('error', (error: Error) => {
      this.logger.debug(`Stream de ${url} terminou com erro: ${error.message}`);
      if (res.headersSent && !res.destroyed) {
        res.destroy(error);
      }
    });

    /** mediamtx devolveu 404: path inexistente/offline → câmera 404. */
    if (upstream.status === 404) {
      upstream.data.destroy();
      throw this.notFound(cameraId);
    }
    /** Qualquer outro status de erro do mediamtx → 502. */
    if (upstream.status >= 400) {
      upstream.data.destroy();
      this.logger.warn(`mediamtx respondeu ${upstream.status} para ${url}`);
      throw this.badGateway('mediamtx');
    }

    const { contentType, cacheControl } = this.resolveContentHeaders(path);
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);

    /** Cliente desconectou (aborto de segmento, troca de stream): fecha o upstream. */
    res.on('close', () => {
      if (!upstream.data.destroyed) {
        upstream.data.destroy();
      }
    });

    upstream.data.pipe(res);
  }

  /**
   * Resolve `Content-Type`/`Cache-Control` pela extensão: playlists nunca são
   * cacheadas (`no-store`); segmentos são imutáveis e podem ser cacheados por
   * uns segundos.
   */
  private resolveContentHeaders(path: string): ContentHeaders {
    const lower = path.toLowerCase();
    if (lower.endsWith('.m3u8')) {
      return {
        contentType: 'application/vnd.apple.mpegurl',
        cacheControl: 'no-store',
      };
    }
    if (lower.endsWith('.m4s')) {
      return { contentType: 'video/iso.segment', cacheControl: 'max-age=10' };
    }
    if (lower.endsWith('.mp4')) {
      return { contentType: 'video/mp4', cacheControl: 'max-age=10' };
    }
    return {
      contentType: 'application/octet-stream',
      cacheControl: 'max-age=10',
    };
  }

  /** Câmera inexistente, desativada ou path offline no mediamtx → 404. */
  private notFound(cameraId: string): CustomHttpException {
    return new CustomHttpException(
      this.errorMessage.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
        RESOURCE: 'Câmera',
        ID: cameraId,
      }),
      HttpStatus.NOT_FOUND,
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  }

  /**
   * Serviço externo (mediamtx ou Firestore) inacessível/em erro → 502. Loga o
   * motivo quando há um erro associado (código axios ou mensagem genérica).
   */
  private badGateway(service: string, error?: unknown): CustomHttpException {
    if (error) {
      const reason = isAxiosError(error)
        ? (error.code ?? error.message)
        : error instanceof Error
          ? error.message
          : 'erro desconhecido';
      this.logger.warn(`Proxy HLS falhou no ${service}: ${reason}`);
    }
    return new CustomHttpException(
      this.errorMessage.getMessage(ErrorCode.EXTERNAL_SERVICE_FAILED, {
        SERVICE: service,
      }),
      HttpStatus.BAD_GATEWAY,
      ErrorCode.EXTERNAL_SERVICE_FAILED,
    );
  }
}
