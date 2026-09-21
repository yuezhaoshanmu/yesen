/** Partial ISO dates preserve the precision of the source; never fill missing parts. */
export function dateParts(date: string | null) {
  const parts = date?.split('-').map(Number);
  return { year: parts?.[0] ?? null, month: parts?.[1] ?? null, day: parts?.[2] ?? null };
}

export function dateText(date: string | null, full = false): string {
  const { year, month, day } = dateParts(date);
  if (!year) return '';
  return `${year}年${month ? `${month}月` : ''}${full && day ? `${day}日` : ''}`;
}

export function dateStamp(date: string | null): string {
  if (!date) return '';
  return date.length === 4 ? `${date}年` : date.slice(0, 7).replace('-', '.');
}
