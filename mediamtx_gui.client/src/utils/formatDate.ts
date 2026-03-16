export function formatDate(dateStr: string | null) {
  if (!dateStr) return "Aldri";
  return new Date(dateStr).toLocaleString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
