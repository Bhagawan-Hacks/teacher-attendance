import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserRound, MessageSquare, Star, Mail, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "../lib/auth";
import { fetchReviews, fetchTeachers, fetchLeaderboard, studentXp } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { Stars } from "../components/Stars";
import { TeacherAvatar } from "../components/TeacherAvatar";
import { Spinner } from "../components/Loading";

export function Profile() {
  const { user } = useAuth();
  const { data: teachers, loading } = useAsync(() => fetchTeachers(), []);
  const { data: allReviews } = useAsync(() => fetchReviews(), []);
  const { data: board } = useAsync(() => fetchLeaderboard(), []);
  const { data: myXp } = useAsync(() => (user ? studentXp(user.email) : Promise.resolve(0)), [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <Spinner />;

  const myReviews = (allReviews ?? []).filter((r) => r.studentEmail === user.email);
  const myRank = board?.find((b) => b.studentEmail === user.email) ?? null;

  const fmtDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-100 text-2xl font-bold text-sage-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl font-600">{user.name}</h1>
                <span className="rounded-full bg-sage-50 px-2.5 py-0.5 text-xs font-medium text-sage-600">
                  {user.role === "admin" ? "Administrator" : "Student"}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-700/65">
                <Mail size={13} className="text-sage-500" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={<Sparkles size={13} />} label="XP" value={`${myXp ?? 0}`} />
            <StatCard icon={<Trophy size={13} />} label="Rank" value={myRank ? `#${myRank.rank}` : "—"} />
            <StatCard icon={<MessageSquare size={13} />} label="Reviews" value={`${myReviews.length}`} />
            <StatCard icon={<Star size={13} />} label="Avg given" value={myReviews.length ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1) : "—"} />
          </div>
        </motion.div>

        <h2 className="mt-8 flex items-center gap-2 font-serif text-xl font-600">
          {user.role === "admin" ? <UserRound size={18} className="text-sage-600" /> : <MessageSquare size={18} className="text-sage-600" />}
          {user.role === "admin" ? "Quick Links" : "Your Reviews"}
        </h2>

        {user.role === "admin" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              to="/admin"
              className="group rounded-2xl border border-cream-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-sage-700">Attendance Console</div>
              <p className="mt-1 text-sm text-ink-700/65">
                Mark today's attendance for every teacher.
              </p>
            </Link>
            <Link
              to="/"
              className="group rounded-2xl border border-cream-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-sage-700">Browse Faculty</div>
              <p className="mt-1 text-sm text-ink-700/65">
                View teacher profiles and student feedback.
              </p>
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {myReviews.length === 0 && (
              <div className="rounded-2xl border border-dashed border-cream-200 bg-white/60 py-12 text-center">
                <p className="text-sm text-ink-700/60">
                  You haven't written any reviews yet. Earn +10 XP per review!
                </p>
                <Link
                  to="/"
                  className="mt-3 inline-block rounded-full bg-sage-700 px-5 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
                >
                  Browse teachers
                </Link>
              </div>
            )}
            {myReviews.map((r, i) => {
              const teacher = (teachers ?? []).find((t) => t.id === r.teacherId);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl border border-cream-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/teacher/${r.teacherId}`}
                      className="flex items-center gap-3 hover:opacity-80"
                    >
                      {teacher && <TeacherAvatar teacher={teacher} size="sm" />}
                      <div>
                        <div className="text-sm font-semibold text-ink-900">
                          {teacher?.name ?? "Teacher"}
                        </div>
                        <div className="text-xs text-ink-700/55">
                          {teacher?.subject} · {fmtDate(r.createdAt)}
                        </div>
                      </div>
                    </Link>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700/80">{r.comment}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream-100/70 px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-700/55">
        {icon} {label}
      </div>
      <div className="mt-1 font-num text-2xl font-semibold">{value}</div>
    </div>
  );
}
