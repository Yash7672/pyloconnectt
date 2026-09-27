// Centralized local date handling.
// The Flutter app uploads data_date as the user's LOCAL calendar date
// (e.g. an Indian user's "2026-09-15"). Using toISOString() would be a
// UTC date and can shift to the previous day around midnight, so we build
// the date string from local getFullYear/getMonth/getDate.

export function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatEpochMs(epochMs) {
  if (!epochMs) return '';
  const d = new Date(epochMs);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatEpochDate(epochMs) {
  if (!epochMs) return '';
  const d = new Date(epochMs);
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}