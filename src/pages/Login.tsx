import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ShieldCheck,
  UserRound,
  ArrowRight,
  Mail,
  Lock,
  Sparkles,
  Star,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { registrationStatus } from "../lib/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "student") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
      const status = await registrationStatus(email.trim());
      if (status !== "approved") {
        if (status === "pending") {
          setError("Your SMC ID is still under review by the admin. Please wait for approval.");
        } else if (status === "rejected") {
          setError("Your registration was rejected. Please contact the admin or sign up again.");
        } else {
          setError("No approved account found. Please sign up with your SMC ID card first.");
        }
        return;
      }
      if (name.trim().length < 2) {
        setError("Please enter your name.");
        return;
      }
      login(name.trim(), email.trim(), "student");
      navigate("/");
    } else {
      if (email.trim() === "admin" && password === "smc2079") {
        login("Administrator", "admin@smc.edu", "admin");
        navigate("/admin");
      } else {
        setError("Invalid admin credentials. Please try again.");
      }
    }
  };

  return (
    <div className="bg-paper flex min-h-[calc(100vh-65px)]">
      {/* Left brand panel (desktop only) */}
      <div className="relative hidden w-[45%] overflow-hidden bg-sage-700 lg:block">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 0%, transparent 35%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-cream-50">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-50/15">
              <GraduationCap size={22} />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-bold">BCA</div>
              <div className="text-[11px] uppercase tracking-wider text-cream-100/70">Faculty Hub</div>
            </div>
          </Link>

          <div>
            <h2 className="font-serif text-3xl font-600 leading-tight">
              Know your teachers.
              <br />
              Shape the classroom together.
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-cream-100/80">
              Explore faculty profiles, track attendance, and share honest feedback —
              all in one calm, welcoming space.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <Feature icon={<Star size={16} />} text="Rate teachers and read student reviews" />
              <Feature icon={<CalendarCheck size={16} />} text="Transparent daily attendance records" />
              <Feature icon={<Sparkles size={16} />} text="Earn XP and climb the student leaderboard" />
            </div>
          </div>

          <p className="text-xs text-cream-100/50">
            © {new Date().getFullYear()} BCA Faculty Hub. Crafted with care.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-600">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-700/65">
              Sign in to review teachers, earn XP, and climb the leaderboard.
            </p>
          </div>

          {/* toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-cream-100 p-1">
            <button
              type="button"
              onClick={() => { setMode("student"); setError(""); }}
              className={`flex items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-all ${
                mode === "student" ? "bg-white text-sage-700 shadow-sm" : "text-ink-700/60"
              }`}
            >
              <UserRound size={15} /> Student
            </button>
            <button
              type="button"
              onClick={() => { setMode("admin"); setError(""); }}
              className={`flex items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-all ${
                mode === "admin" ? "bg-white text-sage-700 shadow-sm" : "text-ink-700/60"
              }`}
            >
              <ShieldCheck size={15} /> Admin
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "student" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hannah K."
                  className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-sage-400 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                {mode === "student" ? "Email address" : "Admin username"}
              </label>
              <div className="relative">
                {mode === "student" ? (
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                ) : (
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                )}
                <input
                  type={mode === "student" ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === "student" ? "you@smc.edu" : "admin"}
                  className="w-full rounded-xl border border-cream-200 bg-cream-50 py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-sage-400 focus:bg-white"
                />
              </div>
            </div>

            {mode === "admin" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-sage-400 focus:bg-white"
                />
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage-700 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
            >
              Continue <ArrowRight size={16} />
            </button>
          </form>

          {mode === "student" ? (
            <div className="mt-5 space-y-3">
              <p className="rounded-lg bg-sage-50 px-3 py-2 text-center text-xs text-sage-600">
                New student? You must sign up with your SMC college ID card first.
              </p>
              <p className="text-center text-sm text-ink-700/70">
                Don't have an account?{" "}
                <Link to="/signup" className="font-semibold text-sage-700 hover:underline">
                  Sign up with ID card
                </Link>
              </p>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-50/15">
        {icon}
      </div>
      <span className="text-sm text-cream-100/85">{text}</span>
    </div>
  );
}
