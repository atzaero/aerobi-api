/**
 * Formata um instante (`Date` ou epoch ms) como `yyyy-MM-dd` no **dia civil
 * local**, espelhando o `dateToIso` do aerobi-web (casa com o `DatePicker` do
 * frontend). Preferir sobre `toISOString().slice(0, 10)`, que usa UTC e diverge
 * do dia civil quando o servidor — ou o instante — não está em UTC.
 */
export function toLocalCivilDate(input: Date | number): string {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
