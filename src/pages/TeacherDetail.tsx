import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Mail,
  CalendarCheck,
  MessageSquare,
  CheckCircle2,
  Lock,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  fetchAttendance,
  fetchReviews,
  fetchTeachers,
  addReview,
  addXp,
  avgRating,
  attendanceRate,
  presentDayCount,
} from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useAuth } from "../lib/auth";
import { Stars, StarPicker } from "../components/Stars";
import { TeacherAvatar } from "../components/TeacherAvatar";
import { AttendanceSummary } from "../components/AttendanceSummary";
import { statusMeta } from "../components/statusMeta";
import { Spinner } from "../components/Loading";
import type { Review } from "../lib/types";

export function TeacherDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: teachers, loading } = useAsync(() => fetchTeachers(), []);
  const { data: allReviews, refresh: refreshReviews } = useAsync(() => fetchReviews(), []);
  const { data: allAttendance } = useAsync(() => fetchAttendance(), []);

  const teacher = teachers?.find((t) => t.id === id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reviews = (allReviews ?? []).filter((r) => r.teacherId === id);
  const attendance = (allAttendance ?? [])
    .filter((a) => a.teacherId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (loading) return <Spinner />;

  if (!teacher) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-24 text-center">
        <h1 className="font-serif text-2xl font-600">Teacher not found</h1>
        <Link to="/" className="mt-4 inline-block text-sage-600 hover:underline">
          Back to all teachers
        </Link>
      </div>
    );
  }

  const ratingAvg = avgRating(reviews);
  const attRate = attendanceRate(attendance);
  const presentDays = presentDayCount(attendance);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "student") return;
    if (comment.trim().length < 4) return;
    setSubmitting(true);

    const newReview: Review = {
      id: `r${Date.now()}`,
      teacherId: teacher.id,
      studentName: user.name,
      studentEmail: user.email,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      anonymous,
    };
    try {
      await addReview(newReview);
      await addXp(user.email, user.name, 10, `Reviewed ${teacher.name}`);
      refreshReviews();
      setComment("");
      setRating(5);
      setAnonymous(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const displayName = (r: Review) => {
    if (r.anonymous) {
      return user?.role === "admin" ? r.studentName : "Anonymous Student";
    }
    return r.studentName;
  };

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-600 hover:text-sage-700"
        >
          <ArrowLeft size={15} /> All teachers
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-5 overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
            <div className="flex justify-center sm:justify-start">
              <TeacherAvatar teacher={teacher} size="lg" className="shrink-0" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="font-serif text-3xl font-600 leading-tight">
                    {teacher.name}
                  </h1>
                  <div className="mt-2 flex items-center gap-2 text-sage-600">
                    <BookOpen size={16} />
                    <span className="font-medium">{teacher.subject}</span>
                  </div>
                </div>
                {ratingAvg > 0 && (
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-num text-3xl font-semibold text-clay-500">
                        {ratingAvg.toFixed(1)}
                      </span>
                      <span className="text-sm text-ink-700/55">/ 5</span>
                    </div>
                    <Stars value={ratingAvg} />
                    <span className="text-xs text-ink-700/55">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              <p className="mt-4 leading-relaxed text-ink-700/80">{teacher.bio}</p>

              <div className="mt-5 grid gap-3 text-sm text-ink-700/70 sm:grid-cols-2 lg:grid-cols-3">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={15} className="text-sage-500" />
                  {teacher.experienceYears} years experience
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={15} className="text-sage-500" />
                  <span className="truncate">{teacher.email}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarCheck size={15} className="text-sage-500" />
                  {presentDays} days present · {attRate}% rate
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Reviews */}
          <section>
            <h2 className="flex items-center gap-2 font-serif text-xl font-600">
              <MessageSquare size={18} className="text-sage-600" />
              Student Reviews
            </h2>

            {/* Review form */}
            <div className="mt-4 rounded-2xl border border-cream-200 bg-white p-5">
              {user?.role === "student" ? (
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-ink-700">Your rating</label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience with this teacher…"
                    className="w-full resize-none rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm outline-none transition-colors focus:border-sage-400 focus:bg-white"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setAnonymous((a) => !a)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        anonymous
                          ? "border-sage-300 bg-sage-50 text-sage-700"
                          : "border-cream-200 bg-white text-ink-700/60 hover:border-sage-300"
                      }`}
                    >
                      {anonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                      {anonymous ? "Posting anonymously" : "Post anonymously"}
                    </button>
                    {submitted ? (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-sage-600">
                        <CheckCircle2 size={16} /> Thank you! Your review was added.
                      </span>
                    ) : (
                      <span className="text-xs text-ink-700/50">
                        {anonymous ? "Your name will be hidden from other students." : `Posting as ${user.name}`}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={comment.trim().length < 4 || submitting}
                      className="rounded-full bg-sage-700 px-5 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Posting…" : "Post review"}
                    </button>
                  </div>
                </form>
              ) : user?.role === "admin" ? (
                <div className="flex items-center gap-3 rounded-xl bg-cream-100 px-4 py-3 text-sm text-ink-700/70">
                  <Lock size={16} className="text-clay-400" />
                  Admins manage attendance. Reviews are submitted by students.
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <Lock size={20} className="text-clay-400" />
                  <p className="text-sm text-ink-700/70">
                    Sign in as a student to leave a rating and comment.
                  </p>
                  <Link
                    to="/login"
                    className="rounded-full bg-sage-700 px-5 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>

            {/* Review list */}
            <div className="mt-5 space-y-4">
              {reviews.length === 0 && (
                <p className="rounded-2xl border border-dashed border-cream-200 bg-white/60 py-10 text-center text-sm text-ink-700/55">
                  No reviews yet — be the first to share your experience.
                </p>
              )}
              {reviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl border border-cream-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 font-semibold text-sage-700">
                        {displayName(r).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                          {displayName(r)}
                          {r.anonymous && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-700/55">
                              <EyeOff size={10} /> anon
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink-700/50">{fmtDate(r.createdAt)}</div>
                      </div>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700/80">{r.comment}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Attendance sidebar */}
          <aside>
            <div className="sticky top-20">
              <h2 className="flex items-center gap-2 font-serif text-xl font-600">
                <CalendarCheck size={18} className="text-sage-600" />
                Attendance
              </h2>
              <p className="mt-1 text-xs text-ink-700/55">
                Recorded daily by the administration.
              </p>

              <div className="mt-4 rounded-2xl border border-cream-200 bg-white p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-ink-700/55">Days present</div>
                    <div className="mt-1 font-num text-2xl font-semibold text-sage-600">{presentDays}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-ink-700/55">Rate</div>
                    <div className="mt-1 font-num text-2xl font-semibold text-sage-600">{attRate}%</div>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-100">
                  <div
                    className="h-full rounded-full bg-sage-500 transition-all"
                    style={{ width: `${attRate}%` }}
                  />
                </div>
              </div>

              {/* Last 10 days attendance summary */}
              <div className="mt-4">
                <AttendanceSummary teacherId={teacher.id} attendance={allAttendance ?? []} days={10} />
              </div>

              <div className="mt-4 space-y-2">
                {attendance.length === 0 && (
                  <p className="rounded-xl border border-dashed border-cream-200 bg-white/60 py-8 text-center text-sm text-ink-700/55">
                    No attendance records yet.
                  </p>
                )}
                {attendance.map((a) => {
                  const m = statusMeta[a.status];
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border border-cream-200 bg-white px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
                        <span className="text-sm font-medium text-ink-900">{fmtDate(a.date)}</span>
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.chip}`}>
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
