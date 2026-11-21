export const pad2 = (n: number) => String(Math.max(0, n)).padStart(2, '0');

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}

const dateFmt = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' });

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso)).replace('.', '').toUpperCase();
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-AR').format(n);
}

/** Strips control chars and trims user-entered text (rendered via React, which escapes HTML). */
export function cleanText(value: string, max: number): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
