import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles, ShieldCheck, Star, Trophy, ArrowRight } from "lucide-react";
import { fetchTeachers, fetchLeaderboard, fetchReviews, fetchAttendance } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { TeacherCard } from "../components/TeacherCard";
import { Spinner } from "../components/Loading";
import heroIllustration from "../assets/hero-illustration.png";

export function Home() {
  const { data: teachers, loading } = useAsync(() => fetchTeachers(), []);
  const { data: reviews } = useAsync(() => fetchReviews(), []);
  const { data: attendance } = useAsync(() => fetchAttendance(), []);
  const { data: board } = useAsync(() => fetchLeaderboard().then((b) => b.slice(0, 5)), []);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!teachers) return [];
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q),
    );
  }, [query, teachers]);

  if (loading) return <Spinner />;

  const teacherList = teachers ?? [];

  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-5 pt-2 pb-10 sm:px-8 lg:px-12 sm:pt-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-sage-50 px-3 py-1 text-xs font-medium text-sage-600">
                <Sparkles size={13} />
                Where great teaching is noticed
              </div>
              <h1 className="mt-5 font-serif text-4xl font-600 leading-[1.1] text-ink-900 sm:text-5xl">
                Know your teachers.
                <br />
                <span className="text-sage-600">Shape the classroom together.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-700/75">
                Explore faculty profiles, see attendance records, and share honest
                feedback. The more you engage, the higher you climb the student
                leaderboard.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden lg:block lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-cream-200 bg-cream-50/50 p-2 shadow-sm">
                <img
                  src={heroIllustration}
                  alt="EduMark Classroom Illustration"
                  className="h-full w-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-cream-100/10 via-transparent to-sage-50/10 pointer-events-none" />
              </div>
            </motion.div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <Stat icon={<Star size={18} />} label="Avg. rating" value="4.8" />
            <Stat icon={<ShieldCheck size={18} />} label="Daily attendance" value="5" />
            <Stat icon={<Sparkles size={18} />} label="Faculty members" value={`${teacherList.length}`} />
          </div>
        </div>
      </section>

      {/* Search + grid */}
      <section className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-600">Our Teachers</h2>
            <p className="mt-1 text-sm text-ink-700/65">
              Tap a profile to read reviews and view attendance history.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or subject…"
              className="w-full rounded-full border border-cream-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-sage-400"
            />
          </div>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <TeacherCard key={t.id} teacher={t} reviews={reviews ?? []} attendance={attendance ?? []} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-cream-200 bg-white/60 py-16 text-center">
            <p className="text-ink-700/60">No teachers match “{query}”.</p>
          </div>
        )}
      </section>

      {/* Leaderboard preview */}
      <section className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 py-12">
        <div className="grid gap-6 rounded-3xl border border-cream-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-500 text-cream-50">
                <Trophy size={20} />
              </div>
              <h2 className="font-serif text-2xl font-600">Student Leaderboard</h2>
            </div>
            <p className="mt-3 leading-relaxed text-ink-700/75">
              Visit daily and share thoughtful reviews to earn XP. The most
              engaged students rise to the top.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-700/70">
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-clay-400" /> +5 XP for each daily visit</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-clay-400" /> +10 XP for every review you post</li>
            </ul>
            <Link
              to="/leaderboard"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-sage-700 px-5 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
            >
              View full leaderboard <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cream-100 bg-cream-50/50">
            {(!board || board.length === 0) && (
              <div className="px-5 py-10 text-center text-sm text-ink-700/55">
                No students on the board yet. Sign up, review teachers, and be the first! 🌱
              </div>
            )}
            {board?.map((e, i) => (
              <div
                key={e.studentEmail}
                className={`flex items-center justify-between px-5 py-3 ${
                  i !== board.length - 1 ? "border-b border-cream-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                    i === 0 ? "bg-clay-500 text-cream-50" : i === 1 ? "bg-sage-300 text-ink-900" : i === 2 ? "bg-clay-300 text-cream-50" : "bg-cream-200 text-ink-700/60"
                  }`}>
                    {e.rank}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-base font-semibold text-sage-700">
                    {e.studentName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-ink-900">{e.studentName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-clay-400" />
                  <span className="font-num text-base font-semibold text-clay-500">{e.xp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-cream-200 bg-white/60 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
        {icon}
      </div>
      <div>
        <div className="font-num text-xl font-semibold leading-none">{value}</div>
        <div className="mt-1 text-xs uppercase tracking-wide text-ink-700/55">{label}</div>
      </div>
    </div>
  );
}
