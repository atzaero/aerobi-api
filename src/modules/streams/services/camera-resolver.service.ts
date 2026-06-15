import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CameraRepository } from '../repositories/camera.repository';
import type { Camera } from '../types/camera';
import { parsePositiveInt } from '../utils/parse-positive-int';

/** TTL padrão do cache da config da câmera (ms). */
const DEFAULT_CACHE_TTL_MS = 60_000;

/**
 * Teto do TTL para resultados **negativos** (`null`). Mais curto que o positivo
 * para que uma câmera recém-cadastrada/reativada apareça pelo proxy em segundos,
 * não no TTL inteiro. Limitado ao TTL positivo (nunca maior). Não cacheia menos
 * que isto sob ataque de ids aleatórios — cada id distinto é lido uma vez.
 */
const NEGATIVE_CACHE_TTL_CAP_MS = 10_000;

/**
 * Teto de entradas no cache. O `cameraId` vem da rota pública (via BFF) e é só
 * fracamente limitado pela regex do DTO, então sem teto um atacante poderia
 * inflar o cache com ids aleatórios (cada miss cacheia um negativo por um TTL).
 * Ao atingir o teto, varremos expirados e, se preciso, removemos as entradas
 * mais antigas (o `Map` preserva ordem de inserção).
 */
const MAX_CACHE_ENTRIES = 1_000;

interface CacheEntry {
  camera: Camera | null;
  expiresAt: number;
}

/**
 * Resolve a config de uma câmera no Firestore por id, com **cache em memória de
 * TTL curto** (`STREAMS_CAMERA_CACHE_TTL_MS`, default 60s).
 *
 * Cada player HLS pede um segmento a cada ~2-4s; sem cache, isso viraria uma
 * consulta ao Firestore por segmento. O cache (positivo **e** negativo) corta
 * esse tráfego, e um mapa de promessas in-flight deduplica leituras concorrentes
 * do mesmo id (evita "thundering herd" no cache miss).
 *
 * Trade-off: uma câmera recém-criada/reativada aparece pelo proxy em até o TTL
 * **negativo** (≤10s), mais curto que o positivo para reduzir essa espera. A
 * listagem (`findEnabledByIcao`) **não** passa por aqui — lê sempre fresco.
 */
@Injectable()
export class CameraResolverService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inflight = new Map<string, Promise<Camera | null>>();
  private readonly ttlMs: number;
  private readonly negativeTtlMs: number;

  constructor(
    private readonly repository: CameraRepository,
    config: ConfigService,
  ) {
    this.ttlMs = parsePositiveInt(
      config.get<string | number>('STREAMS_CAMERA_CACHE_TTL_MS'),
      DEFAULT_CACHE_TTL_MS,
    );
    this.negativeTtlMs = Math.min(this.ttlMs, NEGATIVE_CACHE_TTL_CAP_MS);
  }

  /**
   * Devolve a câmera (cacheada) ou `null` se não existir/estiver soft-deletada.
   * O resultado pode ter `enabled === false` — cabe ao chamador (o proxy)
   * tratar câmera desativada como 404.
   */
  async resolve(cameraId: string): Promise<Camera | null> {
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
      .findById(cameraId)
      .then((camera) => {
        this.evictIfFull();
        const ttl = camera ? this.ttlMs : this.negativeTtlMs;
        this.cache.set(cameraId, {
          camera,
          expiresAt: Date.now() + ttl,
        });
        return camera;
      })
      .finally(() => {
        this.inflight.delete(cameraId);
      });

    this.inflight.set(cameraId, lookup);
    return lookup;
  }

  /**
   * Mantém o cache abaixo de {@link MAX_CACHE_ENTRIES}: primeiro descarta
   * entradas expiradas; se ainda estiver cheio, remove as mais antigas (ordem
   * de inserção do `Map`).
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

  /** Invalida o cache — de uma câmera específica ou de todas (sem argumento). */
  invalidate(cameraId?: string): void {
    if (cameraId) {
      this.cache.delete(cameraId);
      return;
    }
    this.cache.clear();
  }
}
