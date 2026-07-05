/**
 * Mascara o CPF do piloto para exibição na moderação (list/get/decide),
 * espelhando `lib/landing-request-pii.ts` do `aerobi-web`: revela só os 3
 * primeiros e (quando há) os 3 dígitos seguintes, ocultando o resto no formato
 * `XXX.XXX.***-**`. O CPF em claro **nunca** sai numa leitura; o export o omite.
 *
 * `null`/vazio → `null`; menos de 3 dígitos → tudo oculto.
 */
export function maskPilotCpf(cpf: string | null | undefined): string | null {
  if (!cpf) {
    return null;
  }
  const digits = cpf.replace(/\D/g, '');
  if (digits.length < 3) {
    return '***.***.***-**';
  }
  const first = digits.slice(0, 3);
  const second = digits.length >= 6 ? digits.slice(3, 6) : '***';
  return `${first}.${second}.***-**`;
}
