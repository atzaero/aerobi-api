/**
 * Completa o `image_path` devolvido pelo upstream AviaScan numa URL absoluta.
 *
 * O upstream devolve caminhos relativos (ex: `/uploads/<uuid>.jpg`). Para que o
 * cliente consiga carregar a imagem diretamente, prefixamos a base URL da AviaScan
 * (ex: `https://aviascanapi.lmpierin.com.br/uploads/<uuid>.jpg`).
 *
 * - Valores já absolutos (`http://` / `https://`) são devolvidos tal como estão.
 * - Valores vazios / nulos são devolvidos sem alteração.
 *
 * @param imagePath - `image_path` cru do upstream.
 * @param baseUrl - Base URL da AviaScan, sem barra final.
 */
export function resolveAviascanImageUrl(
  imagePath: string | null | undefined,
  baseUrl: string,
): string | null | undefined {
  if (!imagePath) {
    return imagePath;
  }
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
}
