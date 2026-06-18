import {
  RabOperadorDTO,
  RabProprietarioDTO,
} from '../dtos/rab-people-response.dto';

/**
 * Chaves contratuais de cada operador, na ordem do contrato do detalhe
 * `GET /movements/:id` (epic #327). O front coda contra exatamente este
 * conjunto, fiel aos nomes do payload JSON do campo `operadores` do RAB ANAC.
 * O `satisfies` garante, em tempo de compilação, que cada chave existe em
 * {@link RabOperadorDTO} — um typo aqui quebra o build.
 */
const OPERADOR_KEYS = [
  'NOME',
  'DOCUMENTO',
  'OPERACAO135',
  'TRANSPREGULAR135',
  'AUTORIZACAOPMAC135',
  'OPERACAO121',
  'TRANSPREGULAR121',
  'AUTORIZACAOPMAC121',
  'SAE',
  'AUTHISTRUT',
  'UF',
] as const satisfies readonly (keyof RabOperadorDTO)[];

/** Chaves contratuais de cada proprietário (ver {@link OPERADOR_KEYS}). */
const PROPRIETARIO_KEYS = [
  'NOME',
  'DOCUMENTO',
  'PERCENTUAL',
  'UF',
] as const satisfies readonly (keyof RabProprietarioDTO)[];

/**
 * Normaliza um valor cru de campo para `string | null`, preservando o conteúdo
 * tal como veio (inclusive documentos mascarados como `231XXXXXX68`). Apenas
 * coage números/booleanos para texto; ausência (`null`/`undefined`) ou tipos
 * inesperados (objeto/array aninhado) viram `null`.
 */
function coerceFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

/** Verifica se o valor é um objeto simples (não-array, não-nulo). */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Tolera o formato legado `pipe-delimitado` de um único registro no padrão
 * `CHAVE=VALOR|CHAVE=VALOR`. Retorna `[]` quando nenhum par `CHAVE=VALOR` é
 * encontrado, garantindo que texto ilegível nunca quebre a resposta. Só `=` é
 * aceito como separador de par — manter restrito evita que pontuação comum
 * (ex.: `:` de uma URL) seja interpretada como par.
 */
function parseLegacyPipe(text: string): Record<string, unknown>[] {
  const record: Record<string, string> = {};
  let matched = false;
  for (const segment of text.split('|')) {
    const trimmed = segment.trim();
    if (!trimmed) {
      continue;
    }
    const idx = trimmed.indexOf('=');
    if (idx <= 0) {
      continue;
    }
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!key) {
      continue;
    }
    record[key] = value;
    matched = true;
  }
  return matched ? [record] : [];
}

/**
 * Parser puro: converte o texto cru armazenado no snapshot RAB
 * (`operadores`/`proprietarios`, `String?` guardando JSON-como-texto) numa
 * lista de registros genéricos. Aceita um array JSON de objetos, um objeto JSON
 * único (embrulhado num array), e tolera o formato legado pipe-delimitado.
 * Texto vazio, nulo, JSON malformado ou ilegível resulta em `[]`.
 */
function parseRabPeopleRecords(
  raw: string | null | undefined,
): Record<string, unknown>[] {
  if (raw === null || raw === undefined) {
    return [];
  }
  const text = raw.trim();
  if (!text) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.filter(isPlainObject);
    }
    if (isPlainObject(parsed)) {
      return [parsed];
    }
    return [];
  } catch {
    /**
     * Só tenta o formato legado quando o texto tem a cara de pipe-delimitado
     * (contém `|` e não começa como JSON). Caso contrário é JSON malformado e
     * deve resultar em `[]` em vez de virar um registro espúrio.
     */
    if (text.includes('|') && !/^[[{]/.test(text)) {
      return parseLegacyPipe(text);
    }
    return [];
  }
}

/**
 * Projeta um registro genérico no conjunto fixo de `keys`, coagindo cada valor
 * para `string | null`. Chaves ausentes viram `null`; chaves extra são
 * descartadas (o contrato é fechado).
 */
function projectRecord<T>(
  record: Record<string, unknown>,
  keys: readonly string[],
): T {
  const projected: Record<string, string | null> = {};
  for (const key of keys) {
    projected[key] = coerceFieldValue(record[key]);
  }
  return projected as T;
}

/**
 * Normaliza o texto cru de `aircraftSnapshot.operadores` no array tipado do
 * detalhe `GET /movements/:id`. Vazio/ilegível → `[]`.
 */
export function parseOperadores(
  raw: string | null | undefined,
): RabOperadorDTO[] {
  return parseRabPeopleRecords(raw).map((record) =>
    projectRecord<RabOperadorDTO>(record, OPERADOR_KEYS),
  );
}

/**
 * Normaliza o texto cru de `aircraftSnapshot.proprietarios` no array tipado do
 * detalhe `GET /movements/:id`. Vazio/ilegível → `[]`.
 */
export function parseProprietarios(
  raw: string | null | undefined,
): RabProprietarioDTO[] {
  return parseRabPeopleRecords(raw).map((record) =>
    projectRecord<RabProprietarioDTO>(record, PROPRIETARIO_KEYS),
  );
}
