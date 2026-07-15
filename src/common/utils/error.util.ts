/**
 * Normaliza um valor capturado em `catch` (tipado como `unknown` no TS estrito)
 * para uma string legível: devolve `error.message` quando é uma `Error`, caso
 * contrário coage o valor com `String(...)`.
 *
 * Centraliza o padrão `error instanceof Error ? error.message : String(error)`
 * repetido por todo o projeto em logs e mensagens de erro.
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
