const LOCALE = "nb-NO";
const TZ = { timeZone: "Europe/Oslo" } as const;

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString(LOCALE, { day: "2-digit", month: "short", year: "numeric", ...TZ });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleString(LOCALE, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", ...TZ });
}

export function formatTimeOfDay(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", ...TZ });
}
