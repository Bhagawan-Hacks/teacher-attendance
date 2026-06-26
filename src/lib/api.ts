import { supabase, isSupabaseConfigured } from "./supabase";
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
import { getLocalMessages, addLocalMessage } from "./store";

/**
 * Async data layer.
 *
 * - If Supabase is configured (env vars present), all reads/writes hit the
 *   shared cloud database so every user worldwide sees the same data.
 * - If not configured (e.g. local dev without env vars), it falls back to
 *   localStorage with seed data so the app still works for previewing.
 */

// ---------- helpers ----------

function toCamel<T>(row: Record<string, unknown>, map: Record<string, string>): T {
  const out: Record<string, unknown> = {};
  for (const [snake, camel] of Object.entries(map)) {
    if (row[snake] !== undefined) out[camel] = row[snake];
  }
  return out as T;
}

// ---------- Teachers ----------

const TEACHER_MAP: Record<string, string> = {
  id: "id",
  name: "name",
  subject: "subject",
  photo: "photo",
  bio: "bio",
  experience_years: "experienceYears",
  email: "email",
};

export async function fetchTeachers(): Promise<Teacher[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return seedTeachers;
    return data.map((r) => toCamel<Teacher>(r as Record<string, unknown>, TEACHER_MAP));
  }
  // fallback
  return Promise.resolve(getLocalTeachers());
}

export async function saveTeacher(t: Teacher): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("teachers").upsert({
      id: t.id,
      name: t.name,
      subject: t.subject,
      photo: t.photo,
      bio: t.bio,
      experience_years: t.experienceYears,
      email: t.email,
    });
    if (error) throw error;
    return;
  }
  const list = getLocalTeachers();
  const idx = list.findIndex((x) => x.id === t.id);
  if (idx >= 0) list[idx] = t;
  else list.unshift(t);
  localStorage.setItem("edumark_teachers", JSON.stringify(list));
}

export async function deleteTeacher(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  localStorage.setItem(
    "edumark_teachers",
    JSON.stringify(getLocalTeachers().filter((t) => t.id !== id)),
  );
}

function getLocalTeachers(): Teacher[] {
  const raw = localStorage.getItem("edumark_teachers");
  if (!raw) {
    localStorage.setItem("edumark_teachers", JSON.stringify(seedTeachers));
    return seedTeachers;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seedTeachers;
  }
}

// ---------- Attendance ----------

const ATT_MAP: Record<string, string> = {
  id: "id",
  teacher_id: "teacherId",
  date: "date",
  status: "status",
  note: "note",
};

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("attendance").select("*");
    if (error) throw error;
    if (!data) return [];
    return data.map((r) => toCamel<AttendanceRecord>(r as Record<string, unknown>, ATT_MAP));
  }
  return Promise.resolve(getLocalAttendance());
}

export async function saveAttendanceBatch(records: AttendanceRecord[]): Promise<void> {
  if (isSupabaseConfigured) {
    // upsert each (teacher_id, date) combo
    const rows = records.map((r) => ({
      id: r.id,
      teacher_id: r.teacherId,
      date: r.date,
      status: r.status,
      note: r.note ?? "",
    }));
    const { error } = await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "teacher_id,date" });
    if (error) throw error;
    return;
  }
  localStorage.setItem("edumark_attendance", JSON.stringify(records));
}

function getLocalAttendance(): AttendanceRecord[] {
  const raw = localStorage.getItem("edumark_attendance");
  if (!raw) {
    localStorage.setItem("edumark_attendance", JSON.stringify(seedAttendance));
    return seedAttendance;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seedAttendance;
  }
}

export function attendanceRate(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const present = records.filter((r) => r.status === "present" || r.status === "late").length;
  return Math.round((present / records.length) * 100);
}

export function presentDayCount(records: AttendanceRecord[]): number {
  return records.filter((r) => r.status === "present" || r.status === "late").length;
}

// ---------- Reviews ----------

const REV_MAP: Record<string, string> = {
  id: "id",
  teacher_id: "teacherId",
  student_name: "studentName",
  student_email: "studentEmail",
  rating: "rating",
  comment: "comment",
  anonymous: "anonymous",
  created_at: "createdAt",
};

export async function fetchReviews(): Promise<Review[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data) return [];
    return data.map((r) => toCamel<Review>(r as Record<string, unknown>, REV_MAP));
  }
  return Promise.resolve(getLocalReviews());
}

export async function addReview(r: Review): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("reviews").insert({
      id: r.id,
      teacher_id: r.teacherId,
      student_name: r.studentName,
      student_email: r.studentEmail,
      rating: r.rating,
      comment: r.comment,
      anonymous: r.anonymous,
      created_at: r.createdAt,
    });
    if (error) throw error;
    return;
  }
  const all = getLocalReviews();
  localStorage.setItem("edumark_reviews", JSON.stringify([r, ...all]));
}

export function avgRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function getLocalReviews(): Review[] {
  const raw = localStorage.getItem("edumark_reviews");
  if (!raw) {
    localStorage.setItem("edumark_reviews", JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ---------- XP ----------

const XP_MAP: Record<string, string> = {
  id: "id",
  student_email: "studentEmail",
  student_name: "studentName",
  points: "points",
  reason: "reason",
  date: "date",
};

export async function fetchXp(): Promise<XpEntry[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("xp_entries").select("*");
    if (error) throw error;
    if (!data) return [];
    return data.map((r) => toCamel<XpEntry>(r as Record<string, unknown>, XP_MAP));
  }
  return Promise.resolve(getLocalXp());
}

export async function addXp(
  studentEmail: string,
  studentName: string,
  points: number,
  reason: string,
): Promise<void> {
  const entry: XpEntry = {
    id: `x${Date.now()}`,
    studentEmail,
    studentName,
    points,
    reason,
    date: new Date().toISOString().slice(0, 10),
  };
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("xp_entries").insert({
      id: entry.id,
      student_email: entry.studentEmail,
      student_name: entry.studentName,
      points: entry.points,
      reason: entry.reason,
      date: entry.date,
    });
    if (error) throw error;
    return;
  }
  const all = getLocalXp();
  localStorage.setItem("edumark_xp", JSON.stringify([...all, entry]));
}

function getLocalXp(): XpEntry[] {
  const raw = localStorage.getItem("edumark_xp");
  if (!raw) {
    localStorage.setItem("edumark_xp", JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ---------- Visits ----------

const VIS_MAP: Record<string, string> = {
  id: "id",
  student_email: "studentEmail",
  date: "date",
};

export async function fetchVisits(): Promise<VisitEntry[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("visits").select("*");
    if (error) throw error;
    if (!data) return [];
    return data.map((r) => toCamel<VisitEntry>(r as Record<string, unknown>, VIS_MAP));
  }
  return Promise.resolve(getLocalVisits());
}

export async function recordDailyVisit(
  studentEmail: string,
  studentName: string,
): Promise<boolean> {
  if (!studentEmail) return false;
  const today = new Date().toISOString().slice(0, 10);

  if (isSupabaseConfigured) {
    // check if already visited today
    const { data: existing } = await supabase
      .from("visits")
      .select("id")
      .eq("student_email", studentEmail)
      .eq("date", today)
      .maybeSingle();
    if (existing) return false;

    const { error } = await supabase.from("visits").insert({
      id: `v${Date.now()}`,
      student_email: studentEmail,
      date: today,
    });
    if (error) {
      // race condition — unique constraint
      return false;
    }
    await addXp(studentEmail, studentName, 5, "Daily visit");
    return true;
  }

  // local fallback
  const visits = getLocalVisits();
  if (visits.some((v) => v.studentEmail === studentEmail && v.date === today)) return false;
  visits.push({ id: `v${Date.now()}`, studentEmail, date: today });
  localStorage.setItem("edumark_visits", JSON.stringify(visits));
  await addXp(studentEmail, studentName, 5, "Daily visit");
  return true;
}

function getLocalVisits(): VisitEntry[] {
  const raw = localStorage.getItem("edumark_visits");
  if (!raw) {
    localStorage.setItem("edumark_visits", JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ---------- Registrations (KYC) ----------

const REG_MAP: Record<string, string> = {
  id: "id",
  name: "name",
  email: "email",
  id_card_photo: "idCardPhoto",
  status: "status",
  submitted_at: "submittedAt",
  reviewed_at: "reviewedAt",
  reject_reason: "rejectReason",
};

export async function fetchRegistrations(): Promise<Registration[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    if (!data) return [];
    return data.map((r) => toCamel<Registration>(r as Record<string, unknown>, REG_MAP));
  }
  return Promise.resolve(getLocalRegistrations());
}

export async function addRegistration(reg: Registration): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("registrations").insert({
      id: reg.id,
      name: reg.name,
      email: reg.email,
      id_card_photo: reg.idCardPhoto,
      status: reg.status,
      submitted_at: reg.submittedAt,
    });
    if (error) throw error;
    return;
  }
  const all = getLocalRegistrations();
  localStorage.setItem("edumark_registrations", JSON.stringify([reg, ...all]));
}

export async function setRegistrationStatus(
  id: string,
  status: "approved" | "rejected",
  reason?: string,
): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from("registrations")
      .update({
        status,
        reviewed_at: new Date().toISOString().slice(0, 10),
        reject_reason: reason ?? null,
      })
      .eq("id", id);
    if (error) throw error;
    return;
  }
  const all = getLocalRegistrations().map((r) =>
    r.id === id
      ? { ...r, status, reviewedAt: new Date().toISOString().slice(0, 10), rejectReason: reason }
      : r,
  );
  localStorage.setItem("edumark_registrations", JSON.stringify(all));
}

export async function registrationStatus(
  email: string,
): Promise<Registration["status"] | null> {
  const all = await fetchRegistrations();
  const r = all.find((x) => x.email === email);
  return r?.status ?? null;
}

function getLocalRegistrations(): Registration[] {
  const raw = localStorage.getItem("edumark_registrations");
  if (!raw) {
    localStorage.setItem("edumark_registrations", JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ---------- Leaderboard ----------

export interface LeaderboardEntry {
  studentName: string;
  studentEmail: string;
  xp: number;
  reviews: number;
  visits: number;
  rank: number;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const [xp, reviews, visits] = await Promise.all([
    fetchXp(),
    fetchReviews(),
    fetchVisits(),
  ]);

  const byEmail = new Map<
    string,
    { name: string; xp: number; reviews: number; visits: number }
  >();
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

export async function studentXp(studentEmail: string): Promise<number> {
  const xp = await fetchXp();
  return xp
    .filter((e) => e.studentEmail === studentEmail)
    .reduce((s, e) => s + e.points, 0);
}

/* ----------------------------- Group Chat ----------------------------- */

const CHAT_MESSAGE_MAP: Record<string, string> = {
  id: "id",
  sender_name: "senderName",
  sender_email: "senderEmail",
  sender_role: "senderRole",
  content: "content",
  created_at: "createdAt",
};

export async function fetchMessages(): Promise<ChatMessage[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (!data) return [];
    return data.map((r) => toCamel<ChatMessage>(r as Record<string, unknown>, CHAT_MESSAGE_MAP));
  }
  return Promise.resolve(getLocalMessages());
}

export async function sendMessage(msg: ChatMessage): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("messages").insert({
      id: msg.id,
      sender_name: msg.senderName,
      sender_email: msg.senderEmail,
      sender_role: msg.senderRole,
      content: msg.content,
      created_at: msg.createdAt,
    });
    if (error) throw error;
    return;
  }
  addLocalMessage(msg);
  return Promise.resolve();
}
