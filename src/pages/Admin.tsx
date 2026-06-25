import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Save, CalendarDays, CheckCircle2, CalendarCheck, Users, IdCard } from "lucide-react";
import { useAuth } from "../lib/auth";
import {
  fetchAttendance,
  fetchTeachers,
  fetchRegistrations,
  saveAttendanceBatch,
  attendanceRate,
} from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { statusMeta } from "../components/statusMeta";
import { TeacherAvatar } from "../components/TeacherAvatar";
import { TeacherManagement } from "../components/TeacherManagement";
import { KycReview } from "../components/KycReview";
import type { AttendanceRecord } from "../lib/types";
import { Spinner } from "../components/Loading";

const todayISO = () => new Date().toISOString().slice(0, 10);

type Tab = "attendance" | "teachers" | "kyc";

export function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("attendance");
  const { data: regs } = useAsync(() => fetchRegistrations(), []);
  const pendingCount = regs?.filter((r) => r.status === "pending").length ?? 0;

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "attendance", label: "Attendance", icon: <CalendarCheck size={16} /> },
    { id: "teachers", label: "Teachers", icon: <Users size={16} /> },
    { id: "kyc", label: "KYC Verification", icon: <IdCard size={16} />, badge: pendingCount },
  ];

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-700 text-cream-50">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-600">Admin Console</h1>
              <p className="text-sm text-ink-700/65">
                Manage attendance, faculty profiles, and student verification.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-1 rounded-full bg-cream-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id ? "bg-white text-sage-700 shadow-sm" : "text-ink-700/60 hover:text-sage-600"
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge ? (
                <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-bold text-cream-50">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "attendance" && <AttendancePanel />}
          {tab === "teachers" && <TeacherManagement />}
          {tab === "kyc" && <KycReview />}
        </div>
      </div>
    </div>
  );
}

function AttendancePanel() {
  const { data: teachers, loading: tLoading } = useAsync(() => fetchTeachers(), []);
  const { data: records, refresh: refreshAtt } = useAsync(() => fetchAttendance(), []);
  const [date, setDate] = useState(todayISO());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, AttendanceRecord["status"]>>({});

  const teacherList = teachers ?? [];
  const allRecords = records ?? [];

  useEffect(() => {
    const d: Record<string, AttendanceRecord["status"]> = {};
    teacherList.forEach((t) => {
      const existing = allRecords.find((r) => r.teacherId === t.id && r.date === date);
      d[t.id] = existing?.status ?? "present";
    });
    setDraft(d);
  }, [date, allRecords, teacherList]);

  const stats = useMemo(() => {
    const todays = allRecords.filter((r) => r.date === date);
    return {
      present: todays.filter((r) => r.status === "present").length,
      late: todays.filter((r) => r.status === "late").length,
      absent: todays.filter((r) => r.status === "absent").length,
      leave: todays.filter((r) => r.status === "leave").length,
    };
  }, [allRecords, date]);

  if (tLoading) return <Spinner />;

  const setStatus = (teacherId: string, status: AttendanceRecord["status"]) => {
    setDraft((prev) => ({ ...prev, [teacherId]: status }));
  };

  const save = async () => {
    setSaving(true);
    const withoutToday = allRecords.filter((r) => r.date !== date);
    const newRecords: AttendanceRecord[] = teacherList.map((t) => ({
      id: `a-${t.id}-${date}`,
      teacherId: t.id,
      date,
      status: draft[t.id] ?? "present",
    }));
    const updated = [...withoutToday, ...newRecords];
    try {
      await saveAttendanceBatch(newRecords);
      refreshAtt();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-cream-200 bg-white p-5">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <CalendarDays size={16} className="text-sage-600" />
          Attendance date
        </label>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-sage-400 focus:bg-white"
        />
        <p className="mt-2 text-xs text-ink-700/55">{fmtDate(date)}</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <StatBox label="Present" value={stats.present} className="bg-sage-50 text-sage-700" />
          <StatBox label="Late" value={stats.late} className="bg-clay-300/15 text-clay-600" />
          <StatBox label="Absent" value={stats.absent} className="bg-red-50 text-red-600" />
          <StatBox label="On Leave" value={stats.leave} className="bg-cream-100 text-ink-700/70" />
        </div>
      </div>

      <div className="rounded-2xl border border-cream-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-600">Faculty Roster</h2>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-sage-700 px-5 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600 disabled:opacity-50"
          >
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? "Saved" : saving ? "Saving…" : "Save attendance"}
          </button>
        </div>

        {teacherList.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-cream-200 py-8 text-center text-sm text-ink-700/55">
            No teachers yet. Add some in the Teachers tab.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {teacherList.map((t) => {
              const status = draft[t.id] ?? "present";
              const rate = attendanceRate(allRecords.filter((r) => r.teacherId === t.id));
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-1 items-center gap-3 rounded-xl border border-cream-200 bg-cream-50/60 p-3 lg:grid-cols-[1fr_auto]"
                >
                  <div className="flex items-center gap-3">
                    <TeacherAvatar teacher={t} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink-900">{t.name}</div>
                      <div className="truncate text-xs text-ink-700/55">{t.subject} · {rate}% overall</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 lg:justify-end">
                    {(["present", "late", "absent", "leave"] as const).map((s) => {
                      const m = statusMeta[s];
                      const active = status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setStatus(t.id, s)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                            active
                              ? m.chip
                              : "border-cream-200 bg-white text-ink-700/55 hover:border-sage-300"
                          }`}
                          style={active ? { boxShadow: "0 0 0 2px var(--color-sage-300)" } : undefined}
                        >
                          <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${className}`}>
      <div className="font-num text-xl font-semibold leading-none">{value}</div>
      <div className="mt-1 text-xs">{label}</div>
    </div>
  );
}
