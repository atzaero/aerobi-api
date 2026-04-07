/**
 * Normalização do XML AISWEB (raiz aisweb) → objeto pré-validação.
 */

/**
 * Extrai texto de CDATA ou valor direto (fast-xml-parser v5).
 * v5 envolve CDATA em array: [{"#text":"valor"}].
 */
export function unwrapCdata(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.length > 0 ? unwrapCdata(value[0]) : '';
  }
  if (typeof value === 'object' && value !== null && '#text' in value) {
    return unwrapCdata((value as { '#text'?: unknown })['#text']);
  }
  return String(value);
}

/** Texto de um nó XML (CDATA → #text; ignora atributos). Suporta arrays de CDATA (v5). */
export function xmlElementTextContent(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node.trim();
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) {
    return node.map(xmlElementTextContent).join('').trim();
  }
  if (typeof node !== 'object') return '';
  const o = node as Record<string, unknown>;
  if ('#text' in o) {
    const textVal = o['#text'];
    if (Array.isArray(textVal)) {
      return textVal.map(xmlElementTextContent).join('').trim();
    }
    return String(textVal ?? '').trim();
  }
  let acc = '';
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('@_')) continue;
    acc += xmlElementTextContent(v);
  }
  return acc.trim();
}

export function unwrapOptionalNum(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const s = unwrapCdata(value);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function attrString(
  o: Record<string, unknown>,
  name: string,
): string | undefined {
  const v = o[`@_${name}`] ?? o[name];
  if (v == null) return undefined;
  const s = unwrapCdata(v).trim();
  return s === '' ? undefined : s;
}

export function parseTaggedValue(raw: unknown): {
  value?: string;
  compl?: string;
} {
  if (raw == null || raw === '') return {};
  if (typeof raw === 'string' || typeof raw === 'number') {
    const v = String(raw).trim();
    return v ? { value: v } : {};
  }
  if (typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const compl = attrString(o, 'compl');
  let value = '';
  if ('#text' in o && o['#text'] != null) {
    value = String(o['#text']).trim();
  } else {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('@_')) continue;
      if (typeof v === 'string' || typeof v === 'number') {
        value += String(v);
      }
    }
    value = value.trim();
  }
  const out: { value?: string; compl?: string } = {};
  if (value) out.value = value;
  if (compl != null) out.compl = compl;
  return out;
}

export function normalizeValue(
  raw: unknown,
): string | number | Record<string, unknown> | unknown[] | undefined {
  if (raw == null) return undefined;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return raw;
  if (Array.isArray(raw)) {
    return raw.map(normalizeValue) as unknown[];
  }
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('@_')) {
        const key = k.slice(2);
        out[key] = typeof v === 'string' ? v : v;
      } else {
        const normalized = normalizeValue(v);
        if (normalized !== undefined) {
          if (k === 'light' || k === 'runway' || k === 'rmkText') {
            out[k] = Array.isArray(normalized) ? normalized : [normalized];
          } else if (k === 'service') {
            out[k] = Array.isArray(normalized) ? normalized : [normalized];
          } else if (
            k === 'thr' &&
            typeof normalized === 'object' &&
            normalized !== null &&
            !Array.isArray(normalized)
          ) {
            out[k] = [normalized];
          } else {
            out[k] = normalized;
          }
        }
      }
    }
    return out;
  }
  return String(raw);
}

export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function collectLightEntriesFromLightsNodes(lightsRaw: unknown): {
  compl?: string;
  descr?: string;
}[] {
  if (lightsRaw == null) return [];
  const blocks = ensureArray(lightsRaw);
  const out: { compl?: string; descr?: string }[] = [];
  for (const block of blocks) {
    if (block == null || typeof block !== 'object') continue;
    const b = block as Record<string, unknown>;
    const lightRaw = b.light;
    if (lightRaw == null) continue;
    for (const l of ensureArray(lightRaw)) {
      if (l == null || typeof l !== 'object') continue;
      const lo = l as Record<string, unknown>;
      const compl = attrString(lo, 'compl');
      const descr = attrString(lo, 'descr');
      if (compl == null && descr == null) continue;
      out.push({ compl, descr });
    }
  }
  return out;
}

export function parseRmkTextNode(r: unknown): { cod?: string; text?: string } {
  if (r == null || typeof r !== 'object') return {};
  const o = r as Record<string, unknown>;
  const cod = attrString(o, 'cod');
  const text = xmlElementTextContent(o);
  return {
    cod,
    text: text || undefined,
  };
}

export function stripEmptyTagged(t: {
  value?: string;
  compl?: string;
}): { value?: string; compl?: string } | undefined {
  if (t.value == null && t.compl == null) return undefined;
  if (!t.value && !t.compl) return undefined;
  return t;
}

/**
 * Normaliza `<rmkDistDeclared>`: cada campo de `rmkDist` (rwy, tora, toda, etc.)
 * é unwrapped de `[{"#text":"valor"}]` para string plana.
 */
function normalizeDistanceDeclared(raw: unknown): Record<string, unknown> {
  if (raw == null || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const countRaw = o['@_count'] ?? o.count;
  const rmkDistRaw = o.rmkDist;
  const items = (rmkDistRaw != null ? ensureArray(rmkDistRaw) : []).map(
    (item: unknown) => {
      if (item == null || typeof item !== 'object') return {};
      const it = item as Record<string, unknown>;
      const out: Record<string, string | undefined> = {};
      for (const [k, v] of Object.entries(it)) {
        if (k.startsWith('@_')) continue;
        const str = unwrapCdata(v).trim();
        out[k] = str !== '' ? str : undefined;
      }
      return out;
    },
  );
  return {
    count: countRaw != null ? unwrapCdata(countRaw) : undefined,
    items,
  };
}

/**
 * Normaliza `<compls>`: extrai cada `<compl>` como `{ cod, n, text }`,
 * aplicando trim e limpeza de whitespace excessivo no texto.
 */
function normalizeComplements(raw: unknown): Record<string, unknown> {
  if (raw == null || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const countRaw = o['@_count'] ?? o.count;
  const complRaw = o.compl;
  const items = (complRaw != null ? ensureArray(complRaw) : []).map(
    (c: unknown) => {
      if (c == null || typeof c !== 'object') return {};
      const co = c as Record<string, unknown>;
      const cod = attrString(co, 'cod') ?? (co.cod != null ? unwrapCdata(co.cod).trim() || undefined : undefined);
      const n = attrString(co, 'n') ?? (co.n != null ? unwrapCdata(co.n).trim() || undefined : undefined);
      const textRaw = co['#text'];
      const text = xmlElementTextContent(textRaw).replace(/\s+/g, ' ').trim() || undefined;
      return { cod, n, text };
    },
  );
  return {
    count: countRaw != null ? (unwrapOptionalNum(countRaw) ?? unwrapCdata(countRaw)) : undefined,
    items,
  };
}

export function buildRotaerDto(parsed: {
  aisweb?: Record<string, unknown>;
}): Record<string, unknown> {
  const aisweb = parsed?.aisweb;
  if (!aisweb || typeof aisweb !== 'object') {
    return {};
  }

  const dto: Record<string, unknown> = {};

  const status = unwrapCdata(aisweb.status).trim() || undefined;
  const dt = unwrapCdata(aisweb.dt).trim() || undefined;
  if (status != null || dt != null) {
    dto.meta = { status, dt };
  }

  const icao = unwrapCdata(aisweb.AeroCode).trim() || undefined;
  const ciad = unwrapCdata(aisweb.ciad).trim() || undefined;
  const name = unwrapCdata(aisweb.name).trim() || undefined;
  if (icao != null || ciad != null || name != null) {
    dto.identification = { icao, ciad, name };
  }

  const city = unwrapCdata(aisweb.city).trim() || undefined;
  const uf = unwrapCdata(aisweb.uf).trim() || undefined;
  if (city != null || uf != null) {
    dto.locality = { city, uf };
  }

  const lat = unwrapCdata(aisweb.lat).trim() || undefined;
  const lng = unwrapCdata(aisweb.lng).trim() || undefined;
  const latR = unwrapCdata(aisweb.latRotaer).trim() || undefined;
  const lngR = unwrapCdata(aisweb.lngRotaer).trim() || undefined;
  const distance = unwrapCdata(aisweb.distance).trim() || undefined;
  if (
    lat != null ||
    lng != null ||
    latR != null ||
    lngR != null ||
    distance != null
  ) {
    dto.coordinates = {
      latitude: lat,
      longitude: lng,
      latitudeRotaer: latR,
      longitudeRotaer: lngR,
      distance,
    };
  }

  if (aisweb.org != null && typeof aisweb.org === 'object') {
    const org = aisweb.org as Record<string, unknown>;
    const on = unwrapCdata(org.name).trim() || undefined;
    const ot = unwrapCdata(org.type).trim() || undefined;
    const om = unwrapCdata(org.military).trim() || undefined;
    if (on != null || ot != null || om != null) {
      dto.operator = { name: on, type: ot, military: om };
    }
  }

  const timesheets =
    aisweb.timesheets != null ? normalizeValue(aisweb.timesheets) : undefined;
  const timesheetsNonEmpty =
    timesheets != null && timesheets !== '' ? timesheets : undefined;
  const whTagged = stripEmptyTagged(parseTaggedValue(aisweb.workinghour));
  if (whTagged != null || timesheetsNonEmpty != undefined) {
    dto.schedule = {
      workinghour: whTagged,
      timesheets: timesheetsNonEmpty,
    };
  }

  const aerodromeType = unwrapCdata(aisweb.type).trim() || undefined;
  const utilization = unwrapCdata(aisweb.typeUtil).trim() || undefined;
  const operation = unwrapCdata(aisweb.typeOpr).trim() || undefined;
  const category = unwrapCdata(aisweb.cat).trim() || undefined;
  if (
    aerodromeType != null ||
    utilization != null ||
    operation != null ||
    category != null
  ) {
    dto.classification = {
      aerodromeType,
      utilization,
      operation,
      category,
    };
  }

  const utcOffset = unwrapCdata(aisweb.utc).trim() || undefined;
  if (utcOffset != null) dto.timezone = { utcOffset };

  const meters = unwrapCdata(aisweb.altM).trim() || undefined;
  const feet = unwrapCdata(aisweb.altFt).trim() || undefined;
  if (meters != null || feet != null) {
    dto.elevation = { meters, feet };
  }

  const fir = unwrapCdata(aisweb.fir).trim() || undefined;
  const jurisdiction = unwrapCdata(aisweb.jur).trim() || undefined;
  if (fir != null || jurisdiction != null) {
    dto.airspace = { fir, jurisdiction };
  }

  if (aisweb.lights != null && typeof aisweb.lights === 'object') {
    const lights = aisweb.lights as Record<string, unknown>;
    const countRaw = lights['@_count'] ?? lights.count;
    const items = collectLightEntriesFromLightsNodes(lights);
    const count =
      countRaw != null
        ? (unwrapOptionalNum(countRaw) ?? unwrapCdata(countRaw))
        : undefined;
    if (count != null || items.length > 0) {
      dto.aerodromeLights = { count, items };
    }
  }

  if (aisweb.runways != null && typeof aisweb.runways === 'object') {
    const runways = aisweb.runways as Record<string, unknown>;
    const countRaw = runways['@_count'] ?? runways.count;
    const runwayRaw = runways.runway;
    const runwayArr = runwayRaw != null ? ensureArray(runwayRaw) : [];
    const items = runwayArr.map((r: unknown) => {
      if (r == null || typeof r !== 'object') return {};
      const o = r as Record<string, unknown>;
      const rwCompl = attrString(o, 'compl');
      const thrRaw = o.thr;
      const thrArr = thrRaw != null ? ensureArray(thrRaw) : [];
      const runwayLights = collectLightEntriesFromLightsNodes(o.lights);
      return {
        compl: rwCompl,
        type: unwrapCdata(o.type ?? o['@_type']).trim() || undefined,
        ident: unwrapCdata(o.ident).trim() || undefined,
        surface: stripEmptyTagged(parseTaggedValue(o.surface)),
        length: stripEmptyTagged(parseTaggedValue(o.length)),
        width: stripEmptyTagged(parseTaggedValue(o.width)),
        surfaceClassification: stripEmptyTagged(parseTaggedValue(o.surface_c)),
        lights: runwayLights.length > 0 ? runwayLights : undefined,
        thresholds: thrArr.map((t: unknown) => {
          if (t == null || typeof t !== 'object') return {};
          const tObj = t as Record<string, unknown>;
          const thrLights = collectLightEntriesFromLightsNodes(tObj.lights);
          return {
            compl: attrString(tObj, 'compl'),
            ident: unwrapCdata(tObj.ident).trim() || undefined,
            lights: thrLights.length > 0 ? thrLights : undefined,
          };
        }),
      };
    });
    const count =
      countRaw != null
        ? (unwrapOptionalNum(countRaw) ?? unwrapCdata(countRaw))
        : undefined;
    dto.runways = { count, items };
  }

  if (aisweb.services != null && typeof aisweb.services === 'object') {
    const services = aisweb.services as Record<string, unknown>;
    const serviceRaw = services.service;
    const serviceArr = serviceRaw != null ? ensureArray(serviceRaw) : [];
    const items = serviceArr.map((s: unknown) => {
      if (s == null || typeof s !== 'object') return { type: undefined };
      const o = s as Record<string, unknown>;
      const typeVal = unwrapCdata(o['@_type'] ?? o.type).trim() || undefined;
      const rest: Record<string, unknown> = { type: typeVal };
      for (const [k, v] of Object.entries(o)) {
        if (k === 'type' || k.startsWith('@_')) continue;
        rest[k] =
          typeof v === 'object' && v !== null && !Array.isArray(v)
            ? (normalizeValue(v) ?? v)
            : unwrapCdata(v);
      }
      return rest;
    });
    dto.services = { items };
  }

  if (aisweb.rmk != null && typeof aisweb.rmk === 'object') {
    const rmk = aisweb.rmk as Record<string, unknown>;
    const countRaw = rmk['@_count'] ?? rmk.count;
    const rmkTextRaw = rmk.rmkText;
    const rmkTextArr = rmkTextRaw != null ? ensureArray(rmkTextRaw) : [];
    const count =
      countRaw != null
        ? (unwrapOptionalNum(countRaw) ?? unwrapCdata(countRaw))
        : undefined;
    const items = rmkTextArr
      .map(parseRmkTextNode)
      .filter((x) => x.cod != null || (x.text != null && x.text !== ''));
    let distanceDeclared: unknown;
    if (aisweb.rmkDistDeclared != null) {
      distanceDeclared = normalizeDistanceDeclared(aisweb.rmkDistDeclared);
    }
    if (count != null || items.length > 0 || distanceDeclared != undefined) {
      dto.remarks = { count, items, distanceDeclared };
    }
  } else if (aisweb.rmkDistDeclared != null) {
    dto.remarks = {
      distanceDeclared: normalizeDistanceDeclared(aisweb.rmkDistDeclared),
    };
  }

  if (aisweb.compls != null) {
    dto.complements = normalizeComplements(aisweb.compls);
  }

  return dto;
}
