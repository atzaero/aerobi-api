export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Tenta formatos DD/MM/AAAA ou DD/MM/AA
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);

  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  return new Date(year, month - 1, day);
}
