import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Upload, Trash2, Pencil, Save, X, CheckCircle2, ImagePlus } from "lucide-react";
import {
  fetchTeachers,
  saveTeacher,
  deleteTeacher,
} from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { TeacherAvatar } from "../components/TeacherAvatar";
import { Spinner } from "../components/Loading";
import type { Teacher } from "../lib/types";

const emptyDraft: Teacher = {
  id: "",
  name: "",
  subject: "",
  photo: "",
  bio: "",
  experienceYears: 1,
  email: "",
};

export function TeacherManagement() {
  const { data: teachers, loading, refresh } = useAsync(() => fetchTeachers(), []);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Teacher>(emptyDraft);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setDraft({ ...emptyDraft, id: `t${Date.now()}` });
    setAdding(true);
    setEditing(null);
  };

  const startEdit = (t: Teacher) => {
    setDraft({ ...t });
    setEditing(t);
    setAdding(false);
  };

  const cancel = () => {
    setEditing(null);
    setAdding(false);
    setDraft(emptyDraft);
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_500_000) {
      alert("Image too large. Please use one under 2.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const saveDraft = async () => {
    if (draft.name.trim().length < 2) {
      alert("Please enter a teacher name.");
      return;
    }
    setSaving(true);
    try {
      await saveTeacher(draft);
      refresh();
      cancel();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save teacher. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (confirm("Remove this teacher? This cannot be undone.")) {
      await deleteTeacher(id);
      refresh();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-600">Faculty Management</h2>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
        >
          <UserPlus size={16} /> Add teacher
        </button>
      </div>

      {saved && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-sage-50 px-3 py-2 text-sm text-sage-600">
          <CheckCircle2 size={16} /> Teacher saved.
        </div>
      )}

      {/* Add / Edit form */}
      {(adding || editing) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 overflow-hidden rounded-xl border border-sage-200 bg-sage-50/40 p-4"
        >
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            {/* Photo uploader */}
            <div className="flex flex-col items-center gap-2">
              {draft.photo ? (
                <img src={draft.photo} alt="preview" className="h-28 w-28 rounded-full object-cover object-top" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-cream-100 text-ink-700/40">
                  <ImagePlus size={28} />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-medium text-sage-700 transition-colors hover:border-sage-400">
                <Upload size={13} /> Upload photo
                <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
              </label>
            </div>

            {/* Fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Teacher name"
                  className="input"
                />
              </Field>
              <Field label="Subject">
                <input
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="input"
                />
              </Field>
              <Field label="Email">
                <input
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="name@smc.edu"
                  className="input"
                />
              </Field>
              <Field label="Experience (years)">
                <input
                  type="number"
                  min={0}
                  value={draft.experienceYears}
                  onChange={(e) => setDraft({ ...draft, experienceYears: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Bio">
                  <textarea
                    value={draft.bio}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                    rows={2}
                    placeholder="Short biography…"
                    className="input resize-none"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={cancel}
              className="flex items-center gap-1.5 rounded-full border border-cream-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-clay-400"
            >
              <X size={15} /> Cancel
            </button>
            <button
              onClick={saveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600 disabled:opacity-50"
            >
              <Save size={15} /> {saving ? "Saving…" : "Save teacher"}
            </button>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="mt-4 space-y-2">
        {teachers?.length === 0 && (
          <p className="rounded-xl border border-dashed border-cream-200 py-8 text-center text-sm text-ink-700/55">
            No teachers yet. Add one to get started.
          </p>
        )}
        {teachers?.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-1 items-center gap-3 rounded-xl border border-cream-200 bg-cream-50/60 p-3 sm:grid-cols-[1fr_auto]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <TeacherAvatar teacher={t} size="sm" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink-900">{t.name}</div>
                <div className="truncate text-xs text-ink-700/55">{t.subject}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:justify-end">
              <button
                onClick={() => startEdit(t)}
                className="flex items-center gap-1 rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-medium text-sage-700 transition-colors hover:border-sage-400"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={() => remove(t.id)}
                className="flex items-center gap-1 rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-300"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-700/70">{label}</span>
      {children}
    </label>
  );
}
