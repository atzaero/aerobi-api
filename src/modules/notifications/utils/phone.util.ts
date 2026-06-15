/**
 * Utilitários puros de normalização de telefone para WhatsApp.
 *
 * O WhatsApp (e a Evolution) identificam o destinatário por um número só de
 * dígitos com DDI (ex.: `5511999999999`) e por um JID
 * (`5511999999999@s.whatsapp.net`). Os campos `User.phone` vêm sem formato
 * garantido (podem ter `+`, espaços, parênteses, hífens e às vezes sem DDI),
 * então estas funções são o único ponto que decide como interpretar um número
 * cru. São puras (sem efeitos colaterais) e testáveis isoladamente.
 */

/** DDI assumido quando o número não traz código de país (Brasil). */
export const DEFAULT_COUNTRY_CODE = '55';

/** Sufixo de JID de contato individual no WhatsApp. */
export const WHATSAPP_USER_JID_SUFFIX = '@s.whatsapp.net';

/**
 * Quantidade mínima de dígitos (com DDI + DDD + número) para um telefone ser
 * tratado como potencialmente válido. Abaixo disso é ruído/preenchimento parcial.
 */
const MIN_DIGITS = 12;

/** Remove tudo que não for dígito de uma string crua. */
export function sanitizePhone(raw: string): string {
  return raw.replace(/\D+/g, '');
}

/**
 * Converte um telefone cru no número canônico do WhatsApp (só dígitos, com DDI).
 *
 * Regras: remove não-dígitos; se já vier com DDI (>= 12 dígitos) usa como está;
 * se vier um número nacional brasileiro (10 ou 11 dígitos: DDD + assinante)
 * prefixa o {@link DEFAULT_COUNTRY_CODE}. Devolve `null` quando o resultado não
 * atinge {@link MIN_DIGITS} — preferimos não enviar a enviar para um número
 * malformado.
 */
export function toWhatsappNumber(
  raw: string | null | undefined,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string | null {
  if (!raw) return null;
  const digits = sanitizePhone(raw);
  if (!digits) return null;

  const withCountry =
    digits.length >= 10 && digits.length <= 11
      ? `${countryCode}${digits}`
      : digits;

  return withCountry.length >= MIN_DIGITS ? withCountry : null;
}

/** Monta o JID de contato individual a partir de um número (só dígitos). */
export function toWhatsappJid(number: string): string {
  return `${number}${WHATSAPP_USER_JID_SUFFIX}`;
}
