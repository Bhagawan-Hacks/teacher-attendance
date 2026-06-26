import { seedTeachers, seedAttendance } from "./data";
import type {
  AttendanceRecord,
  Review,
  Teacher,
  XpEntry,
  VisitEntry,
  Registration,
  ChatMessage,
} from "./types";

const ATT_KEY = "edumark_attendance";
const REV_KEY = "edumark_reviews";
const XP_KEY = "edumark_xp";
const VIS_KEY = "edumark_visits";
const TEA_KEY = "edumark_teachers";
const REG_KEY = "edumark_registrations";
const MSG_KEY = "edumark_messages";

// Bump this when seed data changes so cached localStorage resets cleanly.
const DATA_VERSION = "v3";
const VER_KEY = "edumark_data_version";

(function resetIfStale() {
  try {
    const v = localStorage.getItem(VER_KEY);
    if (v !== DATA_VERSION) {
      [TEA_KEY, ATT_KEY, REV_KEY, XP_KEY, VIS_KEY, REG_KEY, MSG_KEY].forEach((k) =>
        localStorage.removeItem(k),
      );
      localStorage.setItem(VER_KEY, DATA_VERSION);
    }
  } catch {
    /* ignore */
  }
})();

/* ----------------------------- Teachers ----------------------------- */

export function getTeachers(): Teacher[] {
  const raw = localStorage.getItem(TEA_KEY);
  if (!raw) {
    localStorage.setItem(TEA_KEY, JSON.stringify(seedTeachers));
    return seedTeachers;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seedTeachers;
  }
}

export function saveTeachers(list: Teacher[]) {
  localStorage.setItem(TEA_KEY, JSON.stringify(list));
}

export function getTeacher(id: string): Teacher | undefined {
  return getTeachers().find((t) => t.id === id);
}

export function addTeacher(t: Teacher) {
  const list = getTeachers();
  saveTeachers([t, ...list]);
}

export function updateTeacher(updated: Teacher) {
  const list = getTeachers().map((t) => (t.id === updated.id ? updated : t));
  saveTeachers(list);
}

export function deleteTeacher(id: string) {
  saveTeachers(getTeachers().filter((t) => t.id !== id));
}

/* ----------------------------- Attendance ----------------------------- */

export function getAttendance(): AttendanceRecord[] {
  const raw = localStorage.getItem(ATT_KEY);
  if (!raw) {
    localStorage.setItem(ATT_KEY, JSON.stringify(seedAttendance));
    return seedAttendance;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seedAttendance;
  }
}

export function saveAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(ATT_KEY, JSON.stringify(records));
}

export function attendanceRate(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const present = records.filter((r) => r.status === "present" || r.status === "late").length;
  return Math.round((present / records.length) * 100);
}

export function presentDayCount(records: AttendanceRecord[]): number {
  return records.filter((r) => r.status === "present" || r.status === "late").length;
}

/* ----------------------------- Reviews ----------------------------- */

export function getReviews(): Review[] {
  const raw = localStorage.getItem(REV_KEY);
  if (!raw) {
    localStorage.setItem(REV_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveReviews(reviews: Review[]) {
  localStorage.setItem(REV_KEY, JSON.stringify(reviews));
}

export function avgRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

/* ----------------------------- XP / Leaderboard ----------------------------- */

export function getXp(): XpEntry[] {
  const raw = localStorage.getItem(XP_KEY);
  if (!raw) {
    localStorage.setItem(XP_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveXp(entries: XpEntry[]) {
  localStorage.setItem(XP_KEY, JSON.stringify(entries));
}

export function getVisits(): VisitEntry[] {
  const raw = localStorage.getItem(VIS_KEY);
  if (!raw) {
    localStorage.setItem(VIS_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveVisits(visits: VisitEntry[]) {
  localStorage.setItem(VIS_KEY, JSON.stringify(visits));
}

export function recordDailyVisit(studentEmail: string, studentName: string): boolean {
  if (!studentEmail) return false;
  const today = new Date().toISOString().slice(0, 10);
  const visits = getVisits();
  const already = visits.some((v) => v.studentEmail === studentEmail && v.date === today);
  if (already) return false;
  saveVisits([...visits, { id: `v${Date.now()}`, studentEmail, date: today }]);
  addXp(studentEmail, studentName, 5, "Daily visit");
  return true;
}

export function studentXp(studentEmail: string): number {
  return getXp()
    .filter((e) => e.studentEmail === studentEmail)
    .reduce((s, e) => s + e.points, 0);
}

export interface LeaderboardEntry {
  studentName: string;
  studentEmail: string;
  xp: number;
  reviews: number;
  visits: number;
  rank: number;
}

export function getLeaderboard(): LeaderboardEntry[] {
  const xp = getXp();
  const reviews = getReviews();
  const visits = getVisits();

  const byEmail = new Map<string, { name: string; xp: number; reviews: number; visits: number }>();
  const ensure = (email: string, name: string) => {
    let e = byEmail.get(email);
    if (!e) {
      e = { name, xp: 0, reviews: 0, visits: 0 };
      byEmail.set(email, e);
    }
    if (!e.name && name) e.name = name;
    return e;
  };

  xp.forEach((x) => ensure(x.studentEmail, x.studentName).xp += x.points);
  reviews.forEach((r) => ensure(r.studentEmail, r.studentName).reviews += 1);
  visits.forEach((v) => {
    const name = reviews.find((r) => r.studentEmail === v.studentEmail)?.studentName ?? "";
    ensure(v.studentEmail, name).visits += 1;
  });

  const list = Array.from(byEmail.entries()).map(([email, v]) => ({
    studentName: v.name || email.split("@")[0],
    studentEmail: email,
    xp: v.xp,
    reviews: v.reviews,
    visits: v.visits,
    rank: 0,
  }));

  list.sort((a, b) => b.xp - a.xp || b.reviews - a.reviews);
  list.forEach((e, i) => (e.rank = i + 1));
  return list;
}

export function addXp(studentEmail: string, studentName: string, points: number, reason: string) {
  const entries = getXp();
  entries.push({
    id: `x${Date.now()}`,
    studentEmail,
    studentName,
    points,
    reason,
    date: new Date().toISOString().slice(0, 10),
  });
  saveXp(entries);
}

/* ----------------------------- KYC Registrations ----------------------------- */

export function getRegistrations(): Registration[] {
  const raw = localStorage.getItem(REG_KEY);
  if (!raw) {
    localStorage.setItem(REG_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRegistrations(list: Registration[]) {
  localStorage.setItem(REG_KEY, JSON.stringify(list));
}

export function addRegistration(reg: Registration) {
  saveRegistrations([reg, ...getRegistrations()]);
}

export function setRegistrationStatus(id: string, status: "approved" | "rejected", reason?: string) {
  const list = getRegistrations().map((r) =>
    r.id === id
      ? { ...r, status, reviewedAt: new Date().toISOString().slice(0, 10), rejectReason: reason }
      : r,
  );
  saveRegistrations(list);
}

/** Check if an email has an approved registration. */
export function isApproved(email: string): boolean {
  return getRegistrations().some((r) => r.email === email && r.status === "approved");
}

/** Check the registration status for an email. */
export function registrationStatus(email: string): Registration["status"] | null {
  const r = getRegistrations().find((x) => x.email === email);
  return r?.status ?? null;
}

/* ----------------------------- Group Chat ----------------------------- */

export function getLocalMessages(): ChatMessage[] {
  const raw = localStorage.getItem(MSG_KEY);
  if (!raw) {
    localStorage.setItem(MSG_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalMessages(messages: ChatMessage[]) {
  localStorage.setItem(MSG_KEY, JSON.stringify(messages));
}

export function addLocalMessage(msg: ChatMessage) {
  const all = getLocalMessages();
  saveLocalMessages([...all, msg]);
}
