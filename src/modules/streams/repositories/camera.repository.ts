import { Injectable, Logger } from '@nestjs/common';
import type { Firestore } from 'firebase-admin/firestore';

import { FirestoreService } from '@/common/firestore/firestore.service';

import type { Camera } from '../types/camera';

/** Nome da collection no Firestore onde vive o cadastro de câmeras. */
const CAMERAS_COLLECTION = 'cameras';

/**
 * Hostname/IP da tailnet aceite em `mediamtxNode` (ex.: `aerobi-edge-mvp`,
 * `100.64.0.9`). Restringe a letras, dígitos, ponto e hífen — bloqueia `/`,
 * `@`, `:`, `%` e afins, impedindo injeção de autoridade/porta na URL do proxy
 * (mitiga SSRF a partir de um doc Firestore adulterado).
 */
const MEDIAMTX_NODE_PATTERN = /^[A-Za-z0-9.-]+$/;

/**
 * Path do stream no mediamtx, já sem barras nas pontas. Aceita segmentos
 * `[A-Za-z0-9._-]` separados por `/`; o `mapToCamera` rejeita à parte qualquer
 * `..` (path traversal na URL upstream).
 */
const MEDIAMTX_PATH_PATTERN = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/;

/**
 * Acesso de leitura ao cadastro de câmeras no **Firestore** (collection
 * `cameras`). É o **único** ponto onde nomes de coleção/campos do Firestore são
 * conhecidos — toda a leitura e o mapeamento para o domínio {@link Camera}
 * ficam isolados aqui, espelhando o padrão de adapter/port do módulo
 * `conformity`.
 *
 * O cadastro (CRUD + soft delete) vive no frontend (atzaero/aerobi#1008); o
 * backend só lê. Para tolerar variações de casing enquanto o frontend não
 * estabiliza, os campos são lidos tanto em camelCase quanto em snake_case.
 */
@Injectable()
export class CameraRepository {
  private readonly logger = new Logger(CameraRepository.name);

  constructor(private readonly firestore: FirestoreService) {}

  private get db(): Firestore {
    return this.firestore.getFirestore();
  }

  /**
   * Resolve uma câmera por id de documento. Devolve `null` se o documento não
   * existir, estiver soft-deletado ou for malformado (sem icao/node/path).
   * **Não** filtra por `enabled` — o chamador decide (o proxy bloqueia câmeras
   * desativadas com 404).
   */
  async findById(id: string): Promise<Camera | null> {
    const doc = await this.db.collection(CAMERAS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = (doc.data() ?? {}) as Record<string, unknown>;
    if (this.isDeleted(data)) {
      return null;
    }
    return this.mapToCamera(doc.id, data);
  }

  /**
   * Lista as câmeras **ativas** (`enabled === true`, não soft-deletadas) de um
   * aeródromo pelo código ICAO. A query filtra só por `icao` (evita índice
   * composto no Firestore); `enabled`/soft delete são filtrados em memória — o
   * N por aeródromo é pequeno (ordem de unidades).
   */
  async findEnabledByIcao(icao: string): Promise<Camera[]> {
    const snapshot = await this.db
      .collection(CAMERAS_COLLECTION)
      .where('icao', '==', icao.toUpperCase())
      .get();

    const cameras: Camera[] = [];
    for (const doc of snapshot.docs) {
      const data = (doc.data() ?? {}) as Record<string, unknown>;
      if (this.isDeleted(data)) {
        continue;
      }
      const camera = this.mapToCamera(doc.id, data);
      if (!camera || !camera.enabled) {
        continue;
      }
      cameras.push(camera);
    }

    cameras.sort((a, b) => a.name.localeCompare(b.name));
    return cameras;
  }

  /** `true` quando o documento foi soft-deletado (`deleted_at`/`deletedAt`). */
  private isDeleted(data: Record<string, unknown>): boolean {
    return (data.deleted_at ?? data.deletedAt) != null;
  }

  /**
   * Mapeia um documento Firestore para {@link Camera}. Devolve `null` (com
   * aviso) quando faltam os campos obrigatórios para o proxy, para nunca tentar
   * montar uma URL inválida.
   */
  private mapToCamera(
    id: string,
    data: Record<string, unknown>,
  ): Camera | null {
    const icao = this.readString(data, 'icao');
    const node = this.readString(data, 'mediamtxNode', 'mediamtx_node');
    const path = this.readString(data, 'mediamtxPath', 'mediamtx_path');

    if (!icao || !node || !path) {
      this.logger.warn(
        `Câmera ${id} ignorada: faltam icao, mediamtxNode ou mediamtxPath.`,
      );
      return null;
    }

    /**
     * Validação do alvo do proxy. `mediamtxNode`/`mediamtxPath` vêm do Firestore
     * (gerido pelo painel admin); validar aqui no boundary impede que um doc
     * adulterado/mal preenchido vire SSRF ou path traversal na URL upstream.
     */
    const mediamtxPath = this.stripSlashes(path);
    if (!MEDIAMTX_NODE_PATTERN.test(node)) {
      this.logger.warn(`Câmera ${id} ignorada: mediamtxNode inválido.`);
      return null;
    }
    if (
      !MEDIAMTX_PATH_PATTERN.test(mediamtxPath) ||
      mediamtxPath.includes('..')
    ) {
      this.logger.warn(`Câmera ${id} ignorada: mediamtxPath inválido.`);
      return null;
    }

    return {
      id,
      icao: icao.toUpperCase(),
      name: this.readString(data, 'name') ?? id,
      mediamtxNode: node,
      mediamtxPath,
      enabled: this.readBool(data, 'enabled'),
    };
  }

  /** Remove barras nas pontas para concatenar com o segmento sem `//`. */
  private stripSlashes(value: string): string {
    return value.replace(/^\/+|\/+$/g, '');
  }

  /** Primeiro valor string não vazio entre as chaves candidatas, ou `null`. */
  private readString(
    data: Record<string, unknown>,
    ...keys: string[]
  ): string | null {
    for (const key of keys) {
      const value = data[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    return null;
  }

  /** Primeiro valor booleano entre as chaves candidatas (default `false`). */
  private readBool(data: Record<string, unknown>, ...keys: string[]): boolean {
    for (const key of keys) {
      const value = data[key];
      if (typeof value === 'boolean') {
        return value;
      }
    }
    return false;
  }
}
