import { unwrapCdata } from './aisweb-xml-cdata.util';

const NOTAM_ITEM_KEYS = [
  'id',
  'icaoairport_id',
  'cod',
  'status',
  'cat',
  'dist',
  'tp',
  'dt',
  'n',
  'number',
  'ref_id',
  'ref',
  'ref_n',
  'ref_year',
  'loc',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'nof',
  's',
  'geo',
  'geo_url',
  'aero',
  'cidade',
  'uf',
  'origem',
  'fir',
  'year',
  'traffic',
  'lower',
  'upper',
  'state',
  'purpose',
  'scope',
  'seqnumber',
  'ref_s',
] as const;

export type ParsedNotamXml = {
  aisweb?: {
    notam?: {
      '@_id'?: string;
      '@_total'?: string | number;
      '@_updatedat'?: string;
      item?: unknown;
    } & Record<string, unknown>;
  };
};

function toNormalizedItem(o: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  if (o['@_id'] != null) out.id = unwrapCdata(o['@_id']);
  for (const key of NOTAM_ITEM_KEYS) {
    if (key === 'id') continue;
    if (key in o && o[key] != null) {
      out[key] = unwrapCdata(o[key]);
    }
  }
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('@_')) continue;
    if (v != null && !out[k]) {
      out[k] = unwrapCdata(v);
    }
  }
  return out;
}

/** Garante array de itens a partir do parse (um único item vira [item]). */
export function normalizeNotamItems(parsed: ParsedNotamXml): {
  total: number;
  updatedat?: string;
  rawItems: unknown[];
} {
  const aisweb = parsed?.aisweb;
  if (!aisweb || typeof aisweb !== 'object') return { total: 0, rawItems: [] };

  const notam = (aisweb as { notam?: unknown }).notam;
  if (!notam || typeof notam !== 'object') return { total: 0, rawItems: [] };

  const withAttrs = notam as {
    '@_id'?: string;
    '@_total'?: string | number;
    '@_updatedat'?: string;
    item?: unknown;
  } & Record<string, unknown>;

  const total =
    typeof withAttrs['@_total'] === 'string'
      ? parseInt(withAttrs['@_total'], 10)
      : Number(withAttrs['@_total']) || 0;
  const updatedat =
    typeof withAttrs['@_updatedat'] === 'string'
      ? withAttrs['@_updatedat']
      : undefined;

  const raw = withAttrs.item;
  if (raw != null) {
    const rawItems = Array.isArray(raw) ? raw : [raw];
    const items = rawItems.map((it: unknown) => {
      if (it == null || typeof it !== 'object') return {};
      return toNormalizedItem(it as Record<string, unknown>);
    });
    return { total, updatedat, rawItems: items };
  }

  return { total, updatedat, rawItems: [] };
}
