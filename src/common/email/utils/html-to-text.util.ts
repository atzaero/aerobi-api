/**
 * Deriva a versão `text/plain` de um email a partir do HTML **renderizado**
 * (placeholders já substituídos). Enviar `text` junto do `html` reduz spam
 * score e atende clientes text-only. Heurística simples, suficiente para o
 * HTML controlado dos nossos templates (layout base + átomos):
 *
 * - descarta o `<head>` inteiro (title/style não pertencem ao corpo);
 * - fechamentos de bloco (`</p>`, `</h1>`, `</tr>`, `</table>`, `</div>`) e
 *   `<br>` viram quebras de linha; `</td>` vira espaço (pares rótulo/valor da
 *   info table ficam na mesma linha);
 * - remove as demais tags, decodifica as entidades de `escapeHtml` (+ nbsp)
 *   e colapsa espaços/linhas em branco.
 */
export function htmlToText(html: string): string {
  const withoutHead = html.replace(/<head[\s\S]*?<\/head>/gi, '');

  const withBreaks = withoutHead
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h1|h2|h3|tr|table|div)>/gi, '\n')
    .replace(/<\/td>/gi, ' ');

  const stripped = withBreaks.replace(/<[^>]+>/g, '');

  const decoded = stripped
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  return decoded
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}
