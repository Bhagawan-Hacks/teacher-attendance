import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// These are public env keys (safe to expose — protected by Row Level Security).
// They are read from Vercel env vars at build time.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "YOUR-ANON-KEY";

export const isSupabaseConfigured =
  !SUPABASE_URL.includes("YOUR-PROJECT") &&
  !SUPABASE_ANON_KEY.includes("YOUR-ANON-KEY");

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  { auth: { persistSession: true } },
);
