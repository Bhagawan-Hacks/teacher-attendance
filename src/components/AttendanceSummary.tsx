import { useMemo } from "react";
import { CalendarCheck, Check, X, Clock3, Plane } from "lucide-react";
import type { AttendanceRecord } from "../lib/types";
import { statusMeta } from "./statusMeta";

/**
 * Shows a teacher's attendance for the last `days` days from today,
 * with present/absent/late/leave counts and a day-by-day calendar grid.
 */
export function AttendanceSummary({
  teacherId,
  attendance = [],
  days = 10,
}: {
  teacherId: string;
  attendance?: AttendanceRecord[];
  days?: number;
}) {
  const records = attendance.filter((a) => a.teacherId === teacherId);

  // Build the last N days, oldest first
  const dayList = useMemo(() => {
    const list: { date: string; record?: AttendanceRecord }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      list.push({ date: iso, record: records.find((r) => r.date === iso) });
    }
    return list;
  }, [records, days]);

  const counts = useMemo(() => {
    return {
      present: dayList.filter((d) => d.record?.status === "present").length,
      late: dayList.filter((d) => d.record?.status === "late").length,
      absent: dayList.filter((d) => d.record?.status === "absent").length,
      leave: dayList.filter((d) => d.record?.status === "leave").length,
    };
  }, [dayList]);

  const fmtShort = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
      date: d.getDate(),
      full: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  };

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <CalendarCheck size={16} className="text-sage-600" />
        <h3 className="font-serif text-base font-600">Last {days} Days</h3>
      </div>

      {/* Summary counts */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <CountBadge icon={<Check size={12} />} count={counts.present} label="Present" className="bg-sage-50 text-sage-700" />
        <CountBadge icon={<Clock3 size={12} />} count={counts.late} label="Late" className="bg-clay-300/15 text-clay-600" />
        <CountBadge icon={<X size={12} />} count={counts.absent} label="Absent" className="bg-red-50 text-red-600" />
        <CountBadge icon={<Plane size={12} />} count={counts.leave} label="Leave" className="bg-cream-100 text-ink-700/60" />
      </div>

      {/* Day grid */}
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {dayList.map((d) => {
          const meta = d.record ? statusMeta[d.record.status] : null;
          const info = fmtShort(d.date);
          return (
            <div
              key={d.date}
              className="flex flex-col items-center gap-1 rounded-lg border border-cream-100 bg-cream-50/50 py-2"
              title={`${info.full}${d.record ? ` — ${meta?.label}` : " — No record"}`}
            >
              <span className="text-[10px] font-medium uppercase text-ink-700/45">{info.day}</span>
              <span className="text-sm font-600 text-ink-900">{info.date}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${meta ? meta.dot : "bg-cream-200"}`} />
            </div>
          );
        })}
      </div>

      {/* Detailed list of present & absent dates */}
      <div className="mt-4 space-y-1.5">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-700/55">
          Present & Absent Dates
        </h4>
        {dayList.filter((d) => d.record).length === 0 && (
          <p className="rounded-lg border border-dashed border-cream-200 py-3 text-center text-xs text-ink-700/45">
            No attendance recorded in this period.
          </p>
        )}
        {dayList.filter((d) => d.record).map((d) => {
          const meta = statusMeta[d.record!.status];
          const info = fmtShort(d.date);
          return (
            <div
              key={d.date}
              className="flex items-center justify-between rounded-lg border border-cream-100 bg-cream-50/40 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                <span className="text-xs font-medium text-ink-900">{info.full}</span>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.chip}`}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CountBadge({
  icon,
  count,
  label,
  className,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  className: string;
}) {
  return (
    <div className={`rounded-lg px-1.5 py-2 ${className}`}>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="font-num text-lg font-semibold leading-none">{count}</span>
      </div>
      <div className="mt-1 text-[10px] font-medium opacity-80">{label}</div>
    </div>
  );
}
