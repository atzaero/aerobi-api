/**
 * Monta o header `Content-Disposition` para download com fallback ASCII e
 * filename UTF-8 (RFC 5987).
 */
export function buildAttachmentContentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_');
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
