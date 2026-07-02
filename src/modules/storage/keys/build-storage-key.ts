import { StorageDomain } from './storage-domain.enum';
import { isValidDocType } from './storage-doc-type';

/** Parâmetros para montar a key canônica de um objeto no storage. */
export interface BuildStorageKeyParams {
  /** Entidade/tabela dona do arquivo (1º segmento). */
  domain: StorageDomain;
  /** Id do item dono (2º segmento) — normalmente o PK no banco. */
  itemId: string;
  /** Tipo de arquivo (3º segmento) — deve pertencer ao vocabulário do domínio. */
  docType: string;
  /** Nome do arquivo (`{uuid}[-{slug}].{ext}`), montado por `filename.util`. */
  leaf: string;
}

/** Caracteres proibidos num segmento de path (quebrariam a hierarquia da key). */
const SEGMENT_FORBIDDEN = /[/\s]/;

/**
 * Monta a key canônica `{domain}/{itemId}/{docType}/{leaf}` — o storage espelha
 * o banco (topo = tabela dona). Valida os segmentos (`itemId`/`docType`
 * não-vazios, sem `/` nem espaço), a `leaf` (não-vazia, sem `/`) e o `docType`
 * contra o vocabulário do domínio (`STORAGE_DOC_TYPES`), forçando o registro
 * central de tipos novos em vez de literais soltos.
 */
export function buildStorageKey(params: BuildStorageKeyParams): string {
  const { domain, itemId, docType, leaf } = params;

  assertSegment(itemId, 'itemId');
  assertSegment(docType, 'docType');

  if (!leaf || leaf.trim().length === 0) {
    throw new Error('A leaf da key não pode ser vazia.');
  }
  if (leaf.includes('/')) {
    throw new Error('A leaf da key não pode conter "/".');
  }
  if (!isValidDocType(domain, docType)) {
    throw new Error(
      `docType "${docType}" inválido para o domínio "${domain}" — ` +
        'registre-o em STORAGE_DOC_TYPES.',
    );
  }

  return `${domain}/${itemId}/${docType}/${leaf}`;
}

function assertSegment(value: string, name: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`O segmento "${name}" da key não pode ser vazio.`);
  }
  if (SEGMENT_FORBIDDEN.test(value)) {
    throw new Error(`O segmento "${name}" não pode conter "/" nem espaços.`);
  }
}
