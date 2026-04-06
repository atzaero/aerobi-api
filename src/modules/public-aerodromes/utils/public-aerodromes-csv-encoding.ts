const CHARSET_IN_CONTENT_TYPE = /charset\s*=\s*([^;]+)/i;

function stripQuotes(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

function parseCharsetFromContentType(
  contentType: string | undefined,
): string | undefined {
  if (!contentType) {
    return undefined;
  }
  const m = CHARSET_IN_CONTENT_TYPE.exec(contentType);
  if (!m) {
    return undefined;
  }
  return stripQuotes(m[1]);
}

const ALIASES: Record<string, string> = {
  utf8: 'utf-8',
  'utf-8': 'utf-8',
  'iso-8859-1': 'iso-8859-1',
  iso88591: 'iso-8859-1',
  latin1: 'iso-8859-1',
  'latin-1': 'iso-8859-1',
  'windows-1252': 'windows-1252',
  cp1252: 'windows-1252',
};

function normalizeCharsetLabel(raw: string): string {
  const key = raw.toLowerCase().replaceAll('_', '-').trim();
  return ALIASES[key] ?? key;
}

function isSupportedTextDecoderLabel(label: string): boolean {
  try {
    new TextDecoder(label);
    return true;
  } catch {
    return false;
  }
}

export function resolvePublicAerodromesCsvTextDecoderLabel(
  buffer: Buffer,
  contentTypeHeader?: string,
): string {
  const fromHeader = parseCharsetFromContentType(contentTypeHeader);
  if (fromHeader) {
    const label = normalizeCharsetLabel(fromHeader);
    if (isSupportedTextDecoderLabel(label)) {
      return label;
    }
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    return 'utf-8';
  }

  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    return 'utf-8';
  } catch {
    return 'windows-1252';
  }
}
