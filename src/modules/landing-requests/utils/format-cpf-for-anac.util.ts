/**
 * Formata um CPF (11 dígitos crus) para a query da consulta ANAC de licença
 * (`XXX.XXX.XXX-XX`). Espelha `format-cpf-for-anac-api.ts` do `aerobi-web`: se
 * não tiver 11 dígitos, devolve a entrada intacta (a validação de formato já
 * ocorreu no DTO).
 */
export function formatCpfForAnac(digits: string): string {
  const cpf = digits.replace(/\D/g, '');
  if (cpf.length !== 11) {
    return digits;
  }
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}
