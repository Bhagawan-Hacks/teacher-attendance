import { useState } from "react";
import { motion } from "framer-motion";
import { IdCard, Check, X, Clock, Mail, User, ImageIcon } from "lucide-react";
import {
  fetchRegistrations,
  setRegistrationStatus,
} from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { Spinner } from "../components/Loading";
import type { Registration } from "../lib/types";

export function KycReview() {
  const { data: regs, loading, refresh } = useAsync(() => fetchRegistrations(), []);
  const [selected, setSelected] = useState<string | null>(null);

  const all = regs ?? [];
  const pending = all.filter((r) => r.status === "pending");
  const reviewed = all.filter((r) => r.status !== "pending");
  const selectedReg = all.find((r) => r.id === selected);

  const approve = async (id: string) => {
    await setRegistrationStatus(id, "approved");
    refresh();
  };

  const reject = async (id: string) => {
    await setRegistrationStatus(id, "rejected", "ID card could not be verified.");
    refresh();
  };

  if (loading) return <Spinner />;

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-600">Student KYC Verification</h2>
        <span className="rounded-full bg-clay-300/15 px-3 py-1 text-xs font-medium text-clay-600">
          {pending.length} pending
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-700/55">
        Review each SMC college ID card. Only approved students can sign in.
      </p>

      {/* Pending list */}
      <div className="mt-4 space-y-2">
        {pending.length === 0 && (
          <div className="rounded-xl border border-dashed border-cream-200 py-8 text-center text-sm text-ink-700/55">
            No pending verifications. 🎉
          </div>
        )}
        {pending.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 rounded-xl border border-clay-300/30 bg-clay-300/5 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-300/20 text-clay-600">
                <IdCard size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink-900">{r.name}</div>
                <div className="text-xs text-ink-700/55">{r.email}</div>
                <div className="text-xs text-ink-700/45">Submitted {r.submittedAt}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelected(r.id)}
                className="rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-medium text-sage-700 transition-colors hover:border-sage-400"
              >
                View ID
              </button>
              <button
                onClick={() => approve(r.id)}
                className="flex items-center gap-1 rounded-full bg-sage-600 px-3 py-1.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-sage-700"
              >
                <Check size={13} /> Approve
              </button>
              <button
                onClick={() => reject(r.id)}
                className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
              >
                <X size={13} /> Reject
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reviewed list */}
      {reviewed.length > 0 && (
        <>
          <h3 className="mt-6 text-sm font-semibold text-ink-700/70">Recently reviewed</h3>
          <div className="mt-2 space-y-2">
            {reviewed.slice(0, 8).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-cream-200 bg-cream-50/50 px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-100 text-ink-700/50">
                    <User size={15} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink-900">{r.name}</div>
                    <div className="text-xs text-ink-700/50">{r.email}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    r.status === "approved"
                      ? "bg-sage-50 text-sage-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {r.status === "approved" ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ID card modal */}
      {selectedReg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-5"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-600">SMC ID Card</h3>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full p-1.5 text-ink-700/60 hover:bg-cream-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-ink-700/70">
                <User size={15} className="text-sage-500" /> {selectedReg.name}
              </div>
              <div className="flex items-center gap-2 text-ink-700/70">
                <Mail size={15} className="text-sage-500" /> {selectedReg.email}
              </div>
              <div className="flex items-center gap-2 text-ink-700/70">
                <Clock size={15} className="text-sage-500" /> Submitted {selectedReg.submittedAt}
              </div>
            </div>

            {selectedReg.idCardPhoto ? (
              <img
                src={selectedReg.idCardPhoto}
                alt="SMC ID card"
                className="mt-4 w-full rounded-xl border border-cream-200 object-contain"
              />
            ) : (
              <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-dashed border-cream-200 text-ink-700/40">
                <ImageIcon size={28} />
              </div>
            )}

            {selectedReg.status === "pending" && (
              <div className="mt-5 flex gap-2">
                <button
                  onClick={async () => {
                    await approve(selectedReg.id);
                    setSelected(null);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sage-600 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-700"
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={async () => {
                    await reject(selectedReg.id);
                    setSelected(null);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
