# EduMark — Supabase Setup Guide

This guide shows you how to connect the app to a free Supabase database
so all data is shared worldwide (students, admin, and visitors all see
the same data).

## Step 1 — Create a Supabase Project

1. Go to **https://supabase.com** and sign up (free, no credit card needed).
2. Click **New Project**.
3. Fill in:
   - **Name:** EduMark
   - **Database Password:** choose a strong password (save it!)
   - **Region:** pick the one closest to you
4. Click **Create new project** and wait ~2 minutes for it to provision.

## Step 2 — Run the Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase-schema.sql` from this project.
4. Copy the **entire** contents and paste it into the SQL editor.
5. Click **Run**. You should see “Success. No rows returned.”

This creates all the tables (teachers, attendance, reviews, xp_entries,
visits, registrations) with Row Level Security policies.

## Step 3 — Get Your API Keys

1. In the Supabase dashboard, click **Settings** (gear icon) → **API**.
2. You'll see two important values:
   - **Project URL** — e.g. `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`
3. Copy both of these.

## Step 4 — Add Environment Variables to Vercel

1. Go to your Vercel project dashboard.
2. Click **Settings** → **Environment Variables**.
3. Add two variables:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | your Project URL |
   | `VITE_SUPABASE_ANON_KEY` | your anon public key |

4. Click **Save** for each.
5. Go to **Deployments** and click **Redeploy** on the latest deployment.

## Step 5 — Verify

Once redeployed:
- Visit the site — teachers should load from the database.
- Sign up as a student with an SMC ID card photo.
- Log in as admin (`admin` / `smc2079`) and approve the student.
- The student can now log in, post reviews, and earn XP.
- Everyone worldwide sees the same data.

## Without Supabase (fallback mode)

If the environment variables are NOT set, the app automatically falls back
to **localStorage** (data is only visible in the current browser). This is
fine for local development but NOT for production use.
