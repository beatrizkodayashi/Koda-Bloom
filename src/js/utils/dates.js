/**
 * Utilitários de data — centralizados para evitar bugs de timezone.
 * Datas de ciclo são sempre "dia calendário" (YYYY-MM-DD), sem horário.
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateString(dateStr) {
  if (!DATE_REGEX.test(dateStr)) {
    throw new Error(`Formato de data inválido: ${dateStr}. Use YYYY-MM-DD.`);
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayString() {
  return formatDateString(new Date());
}

export function addDays(dateStr, days) {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateString(date);
}

export function diffDays(startStr, endStr) {
  const start = parseDateString(startStr);
  const end = parseDateString(endStr);
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function isSameOrBefore(a, b) {
  return diffDays(a, b) >= 0;
}

export function isSameOrAfter(a, b) {
  return diffDays(b, a) >= 0;
}

export function startOfMonth(year, month) {
  return formatDateString(new Date(year, month, 1));
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthYear(dateStr) {
  const date = parseDateString(dateStr);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function formatDisplayDate(dateStr, options = {}) {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: options.year ? 'numeric' : undefined,
    ...options,
  });
}

export function formatShortDate(dateStr) {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}
