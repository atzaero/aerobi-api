/** Fuso usado na apresentação de datas das notificações (operação no Brasil). */
const DISPLAY_TIME_ZONE = 'America/Sao_Paulo';

/**
 * Formata um instante (ISO 8601 ou `Date`) como `dd/MM/yyyy HH:mm` no fuso de
 * exibição. Determinístico para a mesma entrada (independe do fuso do host).
 * Devolve string vazia para entrada ausente/ inválida.
 */
export function formatBrDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: DISPLAY_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? '';

  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`;
}
