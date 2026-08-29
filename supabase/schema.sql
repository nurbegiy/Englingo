-- Lingua Track — PostgreSQL / Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ============ CORE ============

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- profiles.id must match auth.users.id (created via a trigger or on sign-up flow)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'teacher', 'admin')),
  display_name text not null,
  username text not null unique,
  branch_id uuid references branches(id),
  group_id uuid, -- FK added after groups table exists
  level text check (level in ('A1','A2','B1','B2','C1','C2')),
  xp integer not null default 0,
  streak_current integer not null default 0,
  streak_best integer not null default 0,
  last_activity_date date,
  avatar_seed text,
  avatar_url text,
  badges text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'blocked')),
  created_at timestamptz not null default now()
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  branch_id uuid not null references branches(id),
  teacher_id uuid not null references profiles(id),
  level text check (level in ('A1','A2','B1','B2','C1','C2')),
  code text not null unique,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

alter table profiles add constraint profiles_group_fk foreign key (group_id) references groups(id);

create table if not exists group_members (
  group_id uuid references groups(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, student_id)
);

-- ============ LEARNING CONTENT ============

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('vocabulary','grammar','listening','reading')),
  level text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  title text,
  passage_text text,   -- reading passages
  audio_url text,      -- listening clips
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  prompt text not null,
  question_type text not null,
  order_index integer not null default 0
);

create table if not exists question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0
);

-- ============ PROGRESS / XP / STREAK ============

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null,
  level text not null,
  correct integer not null,
  total integer not null,
  attempt_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, category, level, attempt_date) -- one XP-earning attempt per day
);

create table if not exists xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount integer not null,
  source text not null,
  created_at timestamptz not null default now()
);

create table if not exists student_progress (
  user_id uuid references profiles(id) on delete cascade,
  -- Text, not uuid: lesson content ids come from the app's built-in question
  -- bank (e.g. "r-a1-1"), not from the `questions` table, so this can't be
  -- a real FK to questions(id).
  question_id text,
  last_result boolean,
  attempts integer not null default 0,
  needs_review boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ============ SOCIAL ============

create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ============ SHOP ============

create table if not exists shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'cosmetic',
  price integer not null,
  image_url text,
  active boolean not null default true
);

create table if not exists shop_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  item_id uuid not null references shop_items(id),
  purchased_at timestamptz not null default now(),
  unique (user_id, item_id)
);

-- ============ CHALLENGES / BADGES ============

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  created_by uuid not null references profiles(id),
  title text not null,
  target integer not null,
  type text not null default 'practices',
  created_at timestamptz not null default now()
);

create table if not exists challenge_participants (
  challenge_id uuid references challenges(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  progress integer not null default 0,
  completed boolean not null default false,
  primary key (challenge_id, user_id)
);

create table if not exists user_badges (
  user_id uuid references profiles(id) on delete cascade,
  badge_key text not null,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_key)
);

-- ============ SETTINGS ============

create table if not exists platform_settings (
  id boolean primary key default true check (id),
  name text not null default 'Lingua Track',
  logo_url text,
  accent_color text not null default 'emerald',
  default_language text not null default 'uz'
);
insert into platform_settings (id) values (true) on conflict do nothing;

-- Indexes
create index if not exists idx_profiles_branch on profiles(branch_id);
create index if not exists idx_profiles_group on profiles(group_id);
create index if not exists idx_profiles_xp on profiles(xp desc);
create index if not exists idx_groups_teacher on groups(teacher_id);
create index if not exists idx_questions_lesson on questions(lesson_id);
create index if not exists idx_xp_tx_user on xp_transactions(user_id);

-- ============ ROW LEVEL SECURITY ============

alter table branches enable row level security;
alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table lessons enable row level security;
alter table questions enable row level security;
alter table question_options enable row level security;
alter table quiz_attempts enable row level security;
alter table xp_transactions enable row level security;
alter table student_progress enable row level security;
alter table follows enable row level security;
alter table shop_items enable row level security;
alter table shop_purchases enable row level security;
alter table challenges enable row level security;
alter table challenge_participants enable row level security;
alter table user_badges enable row level security;
alter table platform_settings enable row level security;

create or replace function is_admin() returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function is_teacher() returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'teacher');
$$;

-- Everyone signed in can read active branches; only admin writes.
create policy "branches read" on branches for select using (true);
create policy "branches admin write" on branches for all using (is_admin()) with check (is_admin());

-- Profiles: public-ish read (leaderboards/social), self or admin write.
create policy "profiles read" on profiles for select using (true);
create policy "profiles self update" on profiles for update using (auth.uid() = id) with check (
  auth.uid() = id
  -- students/teachers may not change role, xp, streaks, or status themselves;
  -- enforce with a trigger (see below) since RLS alone can't diff columns.
);
create policy "profiles admin update" on profiles for update using (is_admin());
create policy "profiles insert self" on profiles for insert with check (auth.uid() = id);

-- Lock down XP/role/status changes to admin or SECURITY DEFINER functions only.
-- SECURITY DEFINER functions that legitimately update xp/status on a
-- student's behalf (complete_practice, purchase_shop_item — see
-- functions.sql) set app.bypass_profile_guard for the duration of their
-- transaction so this trigger doesn't block their own writes.
create or replace function prevent_self_privilege_escalation() returns trigger language plpgsql as $$
begin
  if not is_admin() and coalesce(current_setting('app.bypass_profile_guard', true), 'false') <> 'true' then
    if new.role <> old.role or new.xp <> old.xp or new.status <> old.status then
      raise exception 'Not permitted to modify protected fields';
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_profiles_guard before update on profiles
  for each row execute function prevent_self_privilege_escalation();

-- Groups: readable by anyone in the branch; only the owning teacher or admin writes.
create policy "groups read" on groups for select using (true);
create policy "groups teacher write" on groups for all using (teacher_id = auth.uid() or is_admin())
  with check (teacher_id = auth.uid() or is_admin());

create policy "group_members read" on group_members for select using (true);
create policy "group_members write" on group_members for all using (is_admin() or is_teacher());

-- Learning content: readable by all authenticated users; writable only by admin (service role/seed).
create policy "lessons read" on lessons for select using (auth.role() = 'authenticated');
create policy "lessons admin write" on lessons for all using (is_admin());
create policy "questions read" on questions for select using (auth.role() = 'authenticated');
create policy "questions admin write" on questions for all using (is_admin());
create policy "options read" on question_options for select using (auth.role() = 'authenticated');
create policy "options admin write" on question_options for all using (is_admin());

-- Quiz attempts / XP: users see their own; inserts only via SECURITY DEFINER RPC (see functions.sql).
create policy "attempts read own" on quiz_attempts for select using (user_id = auth.uid() or is_admin() or is_teacher());
create policy "xp read own" on xp_transactions for select using (user_id = auth.uid() or is_admin());
create policy "progress read own" on student_progress for select using (user_id = auth.uid() or is_admin() or is_teacher());

-- Follows: public read, users manage only their own edges.
create policy "follows read" on follows for select using (true);
create policy "follows write own" on follows for all using (follower_id = auth.uid())
  with check (follower_id = auth.uid());

-- Shop: items public; purchases visible to owner/admin, inserted via RPC.
create policy "shop items read" on shop_items for select using (true);
create policy "shop items admin write" on shop_items for all using (is_admin());
create policy "purchases read own" on shop_purchases for select using (user_id = auth.uid() or is_admin());

-- Challenges: readable by group members/teacher/admin; writable by owning teacher/admin.
create policy "challenges read" on challenges for select using (true);
create policy "challenges teacher write" on challenges for all using (created_by = auth.uid() or is_admin());
create policy "challenge participants read" on challenge_participants for select using (user_id = auth.uid() or is_admin() or is_teacher());

create policy "badges read" on user_badges for select using (true);

create policy "settings read" on platform_settings for select using (true);
create policy "settings admin write" on platform_settings for all using (is_admin());
