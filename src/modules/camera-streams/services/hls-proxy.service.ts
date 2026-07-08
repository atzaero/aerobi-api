import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type AxiosResponse, isAxiosError } from 'axios';
import type { Response } from 'express';
import type { Readable } from 'node:stream';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { CameraQueryService } from '@/modules/cameras/services/camera-query.service';
import type { CameraStreamSource } from '@/modules/cameras/types/camera-stream-source';
/**
 * Reusa os padrões anti-SSRF do CRUD (fonte canônica) em vez de duplicá-los — o
 * boundary de escrita e o de leitura têm de bloquear exatamente o mesmo conjunto.
 */
import {
  MEDIAMTX_NODE_PATTERN,
  MEDIAMTX_PATH_PATTERN,
} from '@/modules/cameras/utils/mediamtx.patterns';

import { parsePositiveInt } from '../utils/parse-positive-int';

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
 * via tailnet) — sem transcoding, apenas pipe de bytes. Versão v2 (#473) do
 * proxy `streams`: resolve a câmera no **Postgres** (via {@link
 * CameraQueryService}, do módulo `cameras`), em vez do Firestore.
 *
 * Fluxo de `proxyHls`:
 * 1. Resolve a câmera no Postgres (cacheada via {@link CameraQueryService}).
 * 2. Revalida `mediamtxNode`/`mediamtxPath` (anti-SSRF) e monta
 *    `http://{mediamtxNode}:{porta}/{mediamtxPath}/{path}`.
 * 3. `GET` em streaming via tailnet e repassa os bytes direto pro `Response`.
 *
 * Erros: câmera inexistente/desativada/não-proxiável/offline → **404**; mediamtx
 * fora/timeout → **502**. Falha ao ler o Postgres é dependência **interna** (não
 * serviço externo) → propaga como 500 pelo `AllExceptionsFilter`.
 */
@Injectable()
export class HlsProxyService {
  private readonly logger = new Logger(HlsProxyService.name);
  private readonly timeoutMs: number;
  private readonly hlsPort: number;

  constructor(
    private readonly http: HttpService,
    private readonly cameraQuery: CameraQueryService,
    private readonly errorMessage: ErrorMessageService,
    config: ConfigService,
  ) {
    this.timeoutMs = parsePositiveInt(
      config.get<string | number>('CAMERA_STREAMS_PROXY_TIMEOUT_MS'),
      DEFAULT_TIMEOUT_MS,
    );
    this.hlsPort = parsePositiveInt(
      config.get<string | number>('CAMERA_STREAMS_MEDIAMTX_HLS_PORT'),
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
     * Erro ao ler o Postgres é falha de dependência **interna** → deixa propagar
     * como 500 (o `AllExceptionsFilter` responde). Só o mediamtx (tailnet) é
     * serviço externo → 502. Câmera inexistente/desativada continua 404.
     */
    const camera = await this.cameraQuery.findById(cameraId);
    if (!camera || !camera.enabled) {
      throw this.notFound(cameraId);
    }

    const target = this.buildUpstreamUrl(camera, path, search);
    /**
     * `mediamtxNode`/`mediamtxPath` inválidos (registro fora do padrão do CRUD):
     * trata como câmera não-proxiável (404), nunca monta a URL upstream.
     */
    if (!target) {
      this.logger.warn(
        `Câmera ${cameraId} com mediamtxNode/mediamtxPath inválido — não proxiável.`,
      );
      throw this.notFound(cameraId);
    }

    let upstream: AxiosResponse<Readable>;
    try {
      upstream = await this.http.axiosRef.get<Readable>(target, {
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
      this.logger.debug(
        `Stream de ${target} terminou com erro: ${error.message}`,
      );
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
      this.logger.warn(`mediamtx respondeu ${upstream.status} para ${target}`);
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
   * Monta a URL upstream do mediamtx, revalidando `mediamtxNode`/`mediamtxPath`
   * (anti-SSRF/path traversal) no boundary de leitura. Devolve `null` quando
   * qualquer um é inválido — defense-in-depth mesmo com validação na escrita.
   */
  private buildUpstreamUrl(
    camera: CameraStreamSource,
    path: string,
    search: string,
  ): string | null {
    if (
      !MEDIAMTX_NODE_PATTERN.test(camera.mediamtxNode) ||
      !MEDIAMTX_PATH_PATTERN.test(camera.mediamtxPath)
    ) {
      return null;
    }
    return `http://${camera.mediamtxNode}:${this.hlsPort}/${camera.mediamtxPath}/${path}${search}`;
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

  /** Câmera inexistente, desativada, não-proxiável ou path offline → 404. */
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
   * mediamtx inacessível/em erro → 502. Loga o motivo quando há um erro
   * associado (código axios ou mensagem genérica).
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
