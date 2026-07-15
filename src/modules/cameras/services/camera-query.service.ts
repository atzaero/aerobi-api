import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CameraRepository } from '../repositories/camera.repository';
import type { CameraStreamSource } from '../types/camera-stream-source';
import { parsePositiveInt } from '../utils/parse-positive-int';

/** TTL padrão do cache da câmera (ms). */
const DEFAULT_CACHE_TTL_MS = 60_000;

/**
 * Teto do TTL para resultados **negativos** (`null`). Mais curto que o positivo
 * para que uma câmera recém-criada/reativada apareça pelo proxy em segundos —
 * uma rede de segurança além da invalidação explícita do CRUD (que já cobre o
 * caso comum). Limitado ao TTL positivo (nunca maior).
 */
const NEGATIVE_CACHE_TTL_CAP_MS = 10_000;

/**
 * Teto de entradas no cache. O `cameraId` chega da rota pública do proxy; sem
 * teto, um atacante poderia inflar o cache com ids aleatórios (cada miss cacheia
 * um negativo por um TTL). Ao atingir o teto, varremos expirados e, se preciso,
 * removemos as entradas mais antigas (o `Map` preserva ordem de inserção).
 */
const MAX_CACHE_ENTRIES = 1_000;

interface CacheEntry {
  camera: CameraStreamSource | null;
  expiresAt: number;
}

/**
 * Read-model de câmera para o **proxy HLS público** (`camera-streams`, #473),
 * lendo do **Postgres** (via {@link CameraRepository}). É a superfície que o
 * `CamerasModule` **exporta** para o `camera-streams` consumir — o CRUD interno
 * não expõe rota pública.
 *
 * `findById` tem **cache em memória de TTL curto** (`CAMERA_STREAMS_CACHE_TTL_MS`,
 * default 60s): cada player HLS pede um segmento a cada ~2-4s e o proxy resolve a
 * câmera a cada pedido; sem cache, isso viraria uma query ao Postgres por
 * segmento. O cache (positivo **e** negativo) corta esse tráfego e um mapa de
 * promessas in-flight deduplica leituras concorrentes do mesmo id (evita
 * "thundering herd" no cache miss). O CRUD (`create`/`update`/`delete`) chama
 * {@link invalidate} após cada mutação — **best-effort**: cobre o caso comum,
 * mas uma leitura já *in-flight* iniciada logo antes da mutação pode re-popular o
 * cache com o estado antigo; o TTL curto (positivo/negativo) fecha essa janela
 * residual. A listagem (`findEnabledByIcao`) **não** passa pelo cache — lê sempre
 * fresco.
 */
@Injectable()
export class CameraQueryService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inflight = new Map<
    string,
    Promise<CameraStreamSource | null>
  >();
  private readonly ttlMs: number;
  private readonly negativeTtlMs: number;

  constructor(
    private readonly repository: CameraRepository,
    config: ConfigService,
  ) {
    this.ttlMs = parsePositiveInt(
      config.get<string | number>('CAMERA_STREAMS_CACHE_TTL_MS'),
      DEFAULT_CACHE_TTL_MS,
    );
    this.negativeTtlMs = Math.min(this.ttlMs, NEGATIVE_CACHE_TTL_CAP_MS);
  }

  /**
   * Devolve a câmera (cacheada) ou `null` se não existir/estiver soft-deletada.
   * O resultado pode ter `enabled === false` — cabe ao chamador (o proxy) tratar
   * câmera desativada como 404.
   */
  async findById(cameraId: string): Promise<CameraStreamSource | null> {
    const cached = this.cache.get(cameraId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.camera;
    }
    /** Entrada expirada: remove já, em vez de esperar por uma nova leitura do mesmo id. */
    if (cached) {
      this.cache.delete(cameraId);
    }

    const existing = this.inflight.get(cameraId);
    if (existing) {
      return existing;
    }

    const lookup = this.repository
      .findStreamSourceById(cameraId)
      .then((camera) => {
        this.evictIfFull();
        const ttl = camera ? this.ttlMs : this.negativeTtlMs;
        this.cache.set(cameraId, { camera, expiresAt: Date.now() + ttl });
        return camera;
      })
      .finally(() => {
        this.inflight.delete(cameraId);
      });

    this.inflight.set(cameraId, lookup);
    return lookup;
  }

  /**
   * Lista as câmeras **publicáveis** (ativas e ligadas) de um aeródromo por ICAO,
   * lendo fresco (sem cache): a listagem é pouco frequente e deve refletir o
   * cadastro atual. Normaliza o ICAO para uppercase (como é persistido).
   */
  findEnabledByIcao(icao: string): Promise<CameraStreamSource[]> {
    return this.repository.findEnabledStreamSourcesByIcao(
      icao.trim().toUpperCase(),
    );
  }

  /** Invalida o cache — de uma câmera específica ou de todas (sem argumento). */
  invalidate(cameraId?: string): void {
    if (cameraId) {
      this.cache.delete(cameraId);
      return;
    }
    this.cache.clear();
  }

  /**
   * Mantém o cache abaixo de {@link MAX_CACHE_ENTRIES}: primeiro descarta
   * entradas expiradas; se ainda estiver cheio, remove as mais antigas (ordem de
   * inserção do `Map`).
   */
  private evictIfFull(): void {
    if (this.cache.size < MAX_CACHE_ENTRIES) {
      return;
    }
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
    while (this.cache.size >= MAX_CACHE_ENTRIES) {
      let removed = false;
      for (const key of this.cache.keys()) {
        this.cache.delete(key);
        removed = true;
        break;
      }
      if (!removed) {
        break;
      }
    }
  }
}
