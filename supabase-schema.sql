-- ============================================================
-- EduMark — Supabase Schema
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ---------- TEACHERS ----------
create table if not exists public.teachers (
  id text primary key,
  name text not null,
  subject text not null,
  photo text default '',
  bio text default '',
  experience_years int default 1,
  email text default '',
  created_at timestamptz default now()
);

-- ---------- ATTENDANCE ----------
create table if not exists public.attendance (
  id text primary key,
  teacher_id text not null references public.teachers(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present','absent','late','leave')),
  note text default '',
  unique (teacher_id, date)
);

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id text primary key,
  teacher_id text not null references public.teachers(id) on delete cascade,
  student_name text not null,
  student_email text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  anonymous boolean default false,
  created_at date not null default current_date
);

-- ---------- XP ENTRIES ----------
create table if not exists public.xp_entries (
  id text primary key,
  student_email text not null,
  student_name text not null,
  points int not null,
  reason text not null,
  date date not null default current_date
);

-- ---------- VISITS ----------
create table if not exists public.visits (
  id text primary key,
  student_email text not null,
  date date not null,
  unique (student_email, date)
);

-- ---------- REGISTRATIONS (KYC) ----------
create table if not exists public.registrations (
  id text primary key,
  name text not null,
  email text not null,
  id_card_photo text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at date not null default current_date,
  reviewed_at date,
  reject_reason text
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public read for all tables so students & visitors can see data.
-- Public insert for reviews, xp, visits, registrations.
-- Update/delete restricted (admin only — enforced by the app
-- since there's no auth.users mapping; tighten with real auth later).
-- ============================================================

alter table public.teachers enable row level security;
alter table public.attendance enable row level security;
alter table public.reviews enable row level security;
alter table public.xp_entries enable row level security;
alter table public.visits enable row level security;
alter table public.registrations enable row level security;

-- Teachers: public read, public write (admin manages via app)
create policy "teachers_read" on public.teachers for select using (true);
create policy "teachers_write" on public.teachers for insert with check (true);
create policy "teachers_update" on public.teachers for update using (true);
create policy "teachers_delete" on public.teachers for delete using (true);

-- Attendance: public read, public write
create policy "attendance_read" on public.attendance for select using (true);
create policy "attendance_write" on public.attendance for insert with check (true);
create policy "attendance_update" on public.attendance for update using (true);
create policy "attendance_delete" on public.attendance for delete using (true);

-- Reviews: public read, public insert
create policy "reviews_read" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (true);

-- XP: public read, public insert
create policy "xp_read" on public.xp_entries for select using (true);
create policy "xp_insert" on public.xp_entries for insert with check (true);

-- Visits: public read, public insert
create policy "visits_read" on public.visits for select using (true);
create policy "visits_insert" on public.visits for insert with check (true);

-- Registrations: public read (so login can check status), public insert
create policy "registrations_read" on public.registrations for select using (true);
create policy "registrations_insert" on public.registrations for insert with check (true);
create policy "registrations_update" on public.registrations for update using (true);

-- ---------- MESSAGES (Group Chat) ----------
create table if not exists public.messages (
  id text primary key,
  sender_name text not null,
  sender_email text not null,
  sender_role text not null check (sender_role in ('student', 'admin')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Messages: public read, public insert
create policy "messages_read" on public.messages for select using (true);
create policy "messages_insert" on public.messages for insert with check (true);
