export function formatDuration(duration: string): string {
  const match = duration.match(/^(\d+):(\d{2}):(\d{2})/);
  if (!match) return duration;
  const [, h, m, s] = match;
  if (parseInt(h) > 0) return `${h}h ${m}m ${s}s`;
  if (parseInt(m) > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
