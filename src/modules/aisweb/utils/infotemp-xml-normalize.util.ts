import { ensureArray } from './aisweb-xml-array.util';
import { unwrapCdata } from './aisweb-xml-cdata.util';

/** Remove o literal SQL {ts 'YYYY-MM-DD HH:mm:ss'} que a AISWEB retorna em campos de data. */
function cleanTimestamp(value: string): string {
  const match = value.match(/\{ts '([^']+)'\}/);
  return match ? match[1].trim() : value;
}

export type ParsedInfotempXml = {
  aisweb?: {
    infotemp?: { item?: unknown; '@_total'?: string | number } & Record<
      string,
      unknown
    >;
  };
};

function toNormalizedItem(o: Record<string, unknown>): Record<string, string> {
  return {
    number: unwrapCdata(o.number),
    rmk: unwrapCdata(o.rmk),
    action: unwrapCdata(o.action),
    startdate: cleanTimestamp(unwrapCdata(o.startdate)),
    enddate: cleanTimestamp(unwrapCdata(o.enddate)),
    dt: cleanTimestamp(unwrapCdata(o.dt)),
  };
}

/** Garante array de itens a partir do parse (um único item vira [item]; sem <item> usa filhos diretos). */
export function normalizeInfotempItems(parsed: ParsedInfotempXml): {
  total: number;
  rawItems: unknown[];
} {
  const aisweb = parsed?.aisweb;
  if (!aisweb || typeof aisweb !== 'object') return { total: 0, rawItems: [] };

  const infotemp = (aisweb as { infotemp?: unknown }).infotemp;
  if (!infotemp || typeof infotemp !== 'object')
    return { total: 0, rawItems: [] };

  const withAttrs = infotemp as {
    '@_total'?: string | number;
    item?: unknown;
  } & Record<string, unknown>;
  const total =
    typeof withAttrs['@_total'] === 'string'
      ? parseInt(withAttrs['@_total'], 10)
      : Number(withAttrs['@_total']) || 0;

  const raw = withAttrs.item;
  if (raw != null) {
    const rawItems = ensureArray(raw);
    const items = rawItems.map((it: unknown) => {
      if (it == null || typeof it !== 'object') return {};
      return toNormalizedItem(it as Record<string, unknown>);
    });
    return { total, rawItems: items };
  }

  if (total > 0 && (withAttrs.number != null || withAttrs.rmk != null)) {
    return { total, rawItems: [toNormalizedItem(withAttrs)] };
  }

  return { total, rawItems: [] };
}
