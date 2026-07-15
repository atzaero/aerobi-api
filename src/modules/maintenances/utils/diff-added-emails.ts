/**
 * E-mails que existem em `next` mas não em `prev` (recém-adicionados). Comparação
 * case-insensitive com trim, preservando a grafia de `next` no retorno e sem
 * duplicatas. Usada para decidir quem recebe convite ao editar autorizados.
 */
export function diffAddedEmails(
  prev: ReadonlyArray<string>,
  next: ReadonlyArray<string>,
): string[] {
  const prevSet = new Set(prev.map((e) => e.trim().toLowerCase()));
  const seen = new Set<string>();
  const added: string[] = [];
  for (const email of next) {
    const key = email.trim().toLowerCase();
    if (!key || prevSet.has(key) || seen.has(key)) continue;
    seen.add(key);
    added.push(email.trim());
  }
  return added;
}
