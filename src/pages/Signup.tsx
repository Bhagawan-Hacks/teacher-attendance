import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  IdCard,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  Eye,
} from "lucide-react";
import { addRegistration, registrationStatus } from "../lib/api";
import type { Registration } from "../lib/types";

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idPhoto, setIdPhoto] = useState<string>("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_500_000) {
      setError("Image is too large. Please use one under 2.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setIdPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter the name exactly as it appears on your SMC ID card.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!idPhoto) {
      setError("Please upload a clear photo of your SMC college ID card.");
      return;
    }

    const existing = await registrationStatus(email.trim());
    if (existing === "pending") {
      setError("You already have a registration under review. Please wait for admin approval.");
      return;
    }

    const reg: Registration = {
      id: `reg${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      idCardPhoto: idPhoto,
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    addRegistration(reg);
    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-paper flex min-h-[calc(100vh-65px)] items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl border border-cream-200 bg-white p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-600">Submitted for review</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-700/70">
            Your SMC ID card has been sent to the administrator. You'll be able to
            sign in once your identity is verified. This usually takes a short while.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-cream-100 px-4 py-3 text-sm text-ink-700/70">
            <Clock size={16} className="text-clay-400" />
            Status: <strong className="text-clay-600">Pending verification</strong>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sage-700 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
          >
            Back to sign in <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

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
              <div className="text-xl font-bold">EduMark</div>
              <div className="text-[11px] uppercase tracking-wider text-cream-100/70">Faculty Hub</div>
            </div>
          </Link>

          <div>
            <h2 className="font-serif text-3xl font-600 leading-tight">
              Verify your identity.
              <br />
              Join the community.
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-cream-100/80">
              Upload your SMC college ID card and an administrator will review it.
              Once approved, you can sign in, review teachers, and earn XP.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <Step icon={<IdCard size={16} />} step="1" text="Enter your name and email" />
              <Step icon={<Upload size={16} />} step="2" text="Upload your SMC ID card photo" />
              <Step icon={<UserCheck size={16} />} step="3" text="Admin approves — you're in!" />
            </div>
          </div>

          <p className="text-xs text-cream-100/50">
            Your ID card is only seen by the administrator for verification.
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-700 text-cream-50">
              <IdCard size={22} />
            </div>
            <h1 className="mt-4 font-serif text-3xl font-600">Student Sign-up</h1>
            <p className="mt-1 text-sm text-ink-700/65">
              Verify with your SMC college ID card. An admin will review before you can log in.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                Full name (as on ID card)
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hannah Kapoor"
                className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-sage-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@smc.edu"
                className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-sage-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                SMC college ID card photo
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cream-200 bg-cream-50 px-4 py-8 text-center transition-colors hover:border-sage-400 hover:bg-sage-50/40">
                {idPhoto ? (
                  <>
                    <img src={idPhoto} alt="ID card" className="max-h-40 rounded-lg object-contain" />
                    <span className="flex items-center gap-1.5 text-xs font-medium text-sage-600">
                      <Eye size={13} /> Click to replace
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                      <Upload size={18} />
                    </div>
                    <span className="text-sm font-medium text-ink-700/70">
                      Upload a clear photo of your ID card
                    </span>
                    <span className="text-xs text-ink-700/45">PNG or JPG, max 2.5 MB</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={onFile} className="hidden" />
              </label>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage-700 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
            >
              Submit for verification <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-700/70">
            Already verified?{" "}
            <Link to="/login" className="font-semibold text-sage-700 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Step({ icon, step, text }: { icon: React.ReactNode; step: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-50/15">
        {icon}
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay-400 text-[9px] font-bold text-cream-50">
          {step}
        </span>
      </div>
      <span className="text-sm text-cream-100/85">{text}</span>
    </div>
  );
}
