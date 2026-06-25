import type { AttendanceRecord } from "../lib/types";

export const statusMeta: Record<
  AttendanceRecord["status"],
  { label: string; dot: string; chip: string }
> = {
  present: {
    label: "Present",
    dot: "bg-sage-500",
    chip: "bg-sage-50 text-sage-700 border-sage-200",
  },
  late: {
    label: "Late",
    dot: "bg-clay-400",
    chip: "bg-clay-300/15 text-clay-600 border-clay-300/40",
  },
  absent: {
    label: "Absent",
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-600 border-red-200",
  },
  leave: {
    label: "On Leave",
    dot: "bg-sage-300",
    chip: "bg-cream-100 text-ink-700/70 border-cream-200",
  },
};
