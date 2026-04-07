/** Garante que o parser retorne sempre array: um único <day> vira [day]. */
export function normalizeSolDays(parsed: {
  aisweb?: { day?: unknown };
}): unknown[] {
  const aisweb = parsed?.aisweb;
  if (!aisweb) return [];

  const raw = aisweb.day;
  if (raw == null) return [];

  return Array.isArray(raw) ? raw : [raw];
}
