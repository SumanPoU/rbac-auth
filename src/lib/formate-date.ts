import { format } from "date-fns";

export function formatDate(date: Date | string | null) {
  if (!date) return null;
  const d = new Date(date);
  return format(d, "yyyy/MM/dd");
}
