import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Sparkles, MessageSquare, CalendarCheck } from "lucide-react";
import { fetchLeaderboard } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useAuth } from "../lib/auth";
import { Spinner } from "../components/Loading";

export function Leaderboard() {
  const { user } = useAuth();
  const { data: board, loading } = useAsync(() => fetchLeaderboard(), []);

  if (loading) return <Spinner />;

  const list = board ?? [];
  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  const podiumStyles = [
    "from-clay-400 to-clay-500 text-cream-50",
    "from-sage-300 to-sage-400 text-ink-900",
    "from-clay-300 to-clay-400 text-cream-50",
  ];
  const podiumIcons = [
    <Crown key="1" size={20} />,
    <Medal key="2" size={20} />,
    <Medal key="3" size={20} />,
  ];

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-500 text-cream-50">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-600">Student Leaderboard</h1>
              <p className="text-sm text-ink-700/65">
                Earn XP by visiting daily and sharing thoughtful reviews.
              </p>
            </div>
          </div>
        </motion.div>

        {/* How XP works */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <XpRule icon={<CalendarCheck size={15} />} label="Daily visit" points="+5 XP" />
          <XpRule icon={<MessageSquare size={15} />} label="Post a review" points="+10 XP" />
          <XpRule icon={<Sparkles size={15} />} label="Stay consistent" points="Climb the ranks" />
        </div>

        {/* Your rank */}
        {user?.role === "student" && (
          (() => {
            const me = list.find((b) => b.studentEmail === user.email);
            if (!me) return null;
            return (
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-sage-200 bg-sage-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-700 font-semibold text-cream-50">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-sage-700">You — {user.name}</div>
                    <div className="text-xs text-sage-600/80">
                      Rank #{me.rank} · {me.reviews} reviews · {me.visits} visits
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-num text-2xl font-semibold text-sage-700">{me.xp}</div>
                  <div className="text-xs uppercase tracking-wide text-sage-600/70">XP</div>
                </div>
              </div>
            );
          })()
        )}

        {/* Podium */}
        {top3.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {top3.map((e, i) => (
              <motion.div
                key={e.studentEmail}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`flex flex-col items-center rounded-2xl bg-gradient-to-b ${podiumStyles[i]} p-4 text-center shadow-sm`}
              >
                <div className="mb-1">{podiumIcons[i]}</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-lg font-semibold backdrop-blur">
                  {e.studentName.charAt(0).toUpperCase()}
                </div>
                <div className="mt-2 line-clamp-1 text-sm font-semibold">{e.studentName}</div>
                <div className="font-num text-xl font-semibold">{e.xp}</div>
                <div className="text-[10px] uppercase tracking-wide opacity-80">XP</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Full list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-cream-200 bg-white">
          {list.length === 0 && (
            <div className="py-12 text-center text-sm text-ink-700/55">
              No activity yet. Be the first on the board!
            </div>
          )}
          {rest.map((e, i) => {
            const isMe = user?.email === e.studentEmail;
            return (
              <div
                key={e.studentEmail}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i !== rest.length - 1 ? "border-b border-cream-100" : ""
                } ${isMe ? "bg-sage-50/60" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-num text-sm font-semibold text-ink-700/50">
                    {e.rank}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 font-semibold text-sage-700">
                    {e.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink-900">
                      {e.studentName}
                      {isMe && <span className="ml-1.5 text-xs text-sage-600">(you)</span>}
                    </div>
                    <div className="text-xs text-ink-700/55">
                      {e.reviews} reviews · {e.visits} visits
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-clay-400" />
                  <span className="font-num text-lg font-semibold text-clay-500">{e.xp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function XpRule({ icon, label, points }: { icon: React.ReactNode; label: string; points: string }) {
  return (
    <div className="rounded-xl border border-cream-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-sage-600">{icon}<span className="text-xs font-medium">{label}</span></div>
      <div className="mt-1 font-num text-sm font-semibold text-ink-900">{points}</div>
    </div>
  );
}
