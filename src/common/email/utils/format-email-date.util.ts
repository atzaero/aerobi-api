/**
 * Formata datas para exibição nos emails: `dd/mm/aaaa hh:mm UTC` (ou `—`
 * quando ausente). Mantém **UTC** deliberadamente — é o padrão do domínio
 * (docs/PADRAO_DATAS_UTC.md) e os templates operacionais avisam "horários em
 * UTC (Zulu)"; não converter para fuso local do destinatário.
 */
export function formatEmailDate(date: Date | null | undefined): string {
  if (!date) {
    return '—';
  }
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes} UTC`;
}
