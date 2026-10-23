-- ──────────────────────────────────────────────────────────────
-- LearnMate Production PostgreSQL Schema with Row-Level Security (RLS)
-- Apply in the Supabase SQL Editor.
-- ──────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  plan_id text not null default 'free',
  created_at timestamptz not null default now()
);

-- 2. Study Materials Table
create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_type text not null default 'pdf',
  page_count int not null default 1 check (page_count between 1 and 20),
  extracted_text text not null,
  storage_path text,
  status text not null default 'ready',
  created_at timestamptz not null default now(),
  last_studied_at timestamptz default now()
);

-- 3. Topics Table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.study_materials(id) on delete cascade,
  name text not null,
  mastery numeric(5,2) not null default 0 check (mastery between 0 and 100),
  updated_at timestamptz not null default now(),
  unique(material_id, name)
);

-- 4. Quiz Attempts Table
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid not null references public.study_materials(id) on delete cascade,
  score int not null check (score >= 0),
  total int not null check (total > 0 and score <= total),
  answers jsonb not null default '[]'::jsonb,
  weak_topics text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 5. Revision Tasks Table
create table if not exists public.revision_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid not null references public.study_materials(id) on delete cascade,
  topic text not null,
  title text not null,
  detail text not null,
  minutes int not null default 5 check (minutes > 0),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- 6. Educational Visuals Table
create table if not exists public.educational_visuals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid not null references public.study_materials(id) on delete cascade,
  topic_name text not null,
  concept_title text not null,
  explanation text not null,
  image_url text,
  prompt text not null,
  breakdown jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 7. Subscriptions Table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null default 'free',
  status text not null default 'active',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- 8. Monthly Usage Quotas Table
create table if not exists public.usage_quotas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_year text not null, -- Format 'YYYY-MM'
  uploads_count int not null default 0,
  ai_queries_count int not null default 0,
  visuals_count int not null default 0,
  quizzes_count int not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, month_year)
);

-- ──────────────────────────────────────────────────────────────
-- Row-Level Security (RLS) Configuration
-- ──────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.study_materials enable row level security;
alter table public.topics enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.revision_tasks enable row level security;
alter table public.educational_visuals enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_quotas enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Study Materials Policies
create policy "Users own their materials" on public.study_materials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Topics Policies
create policy "Users view topics of their materials" on public.topics
  for all using (
    exists (select 1 from public.study_materials m where m.id = material_id and m.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.study_materials m where m.id = material_id and m.user_id = auth.uid())
  );

-- Quiz Attempts Policies
create policy "Users own their quiz attempts" on public.quiz_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Revision Tasks Policies
create policy "Users own their revision tasks" on public.revision_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Educational Visuals Policies
create policy "Users own their educational visuals" on public.educational_visuals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subscriptions Policies
create policy "Users can view their subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Usage Quotas Policies
create policy "Users can view their usage quotas" on public.usage_quotas
  for select using (auth.uid() = user_id);

-- Indexes for high-performance querying
create index if not exists idx_study_materials_user on public.study_materials(user_id, created_at desc);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts(user_id, material_id);
create index if not exists idx_visuals_user on public.educational_visuals(user_id, material_id);
create index if not exists idx_quotas_user_month on public.usage_quotas(user_id, month_year);
