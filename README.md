# Lingua Track — English Learning Platform

Gamified English practice for educational centers. React + Vite + Tailwind on
the frontend, Supabase (Postgres + Auth) on the backend.

## 1. Install

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173` and runs immediately in **demo
mode** with local mock data (no Supabase account needed) — every screen is
browsable: student flow, teacher flow, admin panel.

Use the **"Demo quick sign-in"** buttons on the auth screen to jump straight
into a seeded Student / Teacher / Admin account.

## 2. Configure Supabase (for real data)

1. Create a project at supabase.com.
2. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxxxxx
   ```
3. Restart `npm run dev`. The app automatically switches out of demo mode as
   soon as both variables are present (`VITE_DEMO_MODE=true` forces demo mode
   even with keys set, useful for previewing UI changes).

## 3. Run the SQL schema

In the Supabase SQL editor, run in order:

1. `supabase/schema.sql` — tables, indexes, Row Level Security policies.
2. `supabase/functions.sql` — SECURITY DEFINER functions (`complete_practice`,
   `purchase_shop_item`, `join_group_by_code`, `verify_teacher_code`). XP,
   streaks, and purchases are always computed **inside these functions**, not
   trusted from the client.
3. `supabase/seed.sql` — demo branches, shop items, teacher code, and one
   example lesson. Extend it with more `lessons` / `questions` /
   `question_options` rows for full A1–C2 coverage (the demo dataset in
   `src/mock/data.js` shows the intended shape for all four categories).

## 4. Seed the database

`supabase/seed.sql` covers branches, shop items, and the teacher
registration code. Learning content (vocabulary/grammar/listening/reading
questions for every level) should be inserted the same way — one `lessons`
row per category+level, with linked `questions` and `question_options` rows.
This keeps content entirely in the database, with no lesson-editing UI, as
specified.

## 5. `.env` configuration

See `.env.example`. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are
required. Never put the service role key in the frontend.

## 6. Super Admin account

There is exactly one Super Admin. To create it:

1. Sign the person up normally through Supabase Auth (dashboard → Authentication → Add user, or your own script).
2. Insert their profile row directly with `role = 'admin'`:
   ```sql
   insert into profiles (id, role, display_name, username, status)
   values ('<their-auth-user-uuid>', 'admin', 'Super Admin', 'super_admin', 'active');
   ```
   Do this once, outside the normal sign-up screens (there is intentionally
   no admin self-registration flow).

Teacher accounts require the code seeded in `teacher_codes`
(`TEACH-2026-SMD` by default — change it before going live, and never expose
it in frontend code; `verify_teacher_code()` reads it server-side only).

## 8. Already ran schema.sql / functions.sql / seed.sql before this update?

Run `supabase/patch_avatars_branding.sql` once — it adds the `avatar_url`
column to `profiles` and creates the `avatars` / `branding` Storage buckets
(with RLS policies) used by profile photo and platform logo uploads.

**Also run `supabase/patch_fix_practice_completion.sql` once** if your project
predates this update. It fixes two bugs that made finishing a practice
session (especially listening/reading) hang with no XP awarded: a guard
trigger on `profiles` was blocking XP updates made by the app's own
`complete_practice`/`purchase_shop_item` functions, and wrong-answer ids were
declared as `uuid[]` when the app actually sends plain text ids. Safe to
re-run; both files are idempotent.

**Then also run `supabase/patch_fix_xp_overload.sql` once.** Changing a
function's parameter type with `create or replace` doesn't replace it in
Postgres — a different argument type creates a second, overloaded function,
leaving two versions of `complete_practice` in place and every call
ambiguous. This patch explicitly drops the old signature first, adds
explicit `grant execute` statements, and adds a few defensive RLS insert
policies — run it even if you already ran the previous patch.

## 9. Run the project

```bash
npm run dev       # local development
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## 10. Deploy (GitHub → Vercel)

1. Push this repo to GitHub, then import it in Vercel ("Add New… → Project").
   `vercel.json` is already set up (Vite build, `dist/` output, SPA rewrites
   so refreshing `/app/learn` etc. doesn't 404).
2. In Vercel's project settings → Environment Variables, add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as your
   `.env`).
3. Free-tier Supabase projects auto-pause after ~7 days with no API
   activity. `.github/workflows/keep-supabase-awake.yml` pings Supabase once
   a day to prevent that — add these two repository secrets under
   **GitHub repo → Settings → Secrets and variables → Actions**:
   - `SUPABASE_URL` — same as `VITE_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` — same as `VITE_SUPABASE_ANON_KEY`
   You can trigger it manually from the Actions tab ("Run workflow") to
   confirm it's wired up correctly.

## Project structure

```
src/
  components/    ui / layout / learning / leaderboard / profile / shop / teacher / admin
  hooks/         useAuth, useTheme, useI18n, useLeaderboard
  lib/           supabase.js (client), dataClient.js (Supabase ⇄ demo-mode facade)
  mock/          local demo dataset (mirrors the Supabase schema)
  locales/       uz / ru / en translation JSON
  pages/         auth, student, teacher, admin route screens
  routes/        ProtectedRoute (role-based route guards)
supabase/
  schema.sql     tables + Row Level Security policies
  functions.sql  SECURITY DEFINER RPCs for XP, purchases, group join, teacher code
  seed.sql       demo branches / shop items / teacher code / example lesson
```

## What's implemented

- Branch selection → student/teacher sign-up, Supabase Auth session persistence
- Deterministic rule-based placement test → CEFR level (separate from XP)
- Vocabulary / Grammar / Listening / Reading practice with automatic,
  anti-abuse XP (one rewarded completion per category+level+day), wrong-answer
  tracking for later review
- Streaks (current + best), Group / Branch / All-branches leaderboards
- XP shop with purchase validation, follow/follower social graph, public
  student profiles
- Teacher: create groups (auto-generated join codes), view members + XP,
  post simple challenges
- Admin: dashboard stats, branches (add/rename/deactivate), students,
  teachers, groups (add/edit/deactivate), shop rewards (add/edit/deactivate)
  management, statistics, platform settings (name + accent color)
- Light / dark / system theme with a configurable accent color, uz/ru/en
  interface language switching, mobile bottom nav + desktop sidebar

## Notes for going to production

- Replace `TEACH-2026-SMD` and re-seed `teacher_codes`.
- Move XP/streak/purchase logic fully onto `functions.sql` (already written)
  — the demo-mode code path in `src/lib/dataClient.js` exists only so the UI
  works without credentials, and is bypassed automatically once Supabase
  keys are set.
- Populate `lessons` / `questions` / `question_options` for every
  category × level combination — the seed file only ships one example row.
- Consider Supabase Storage + `image_url` on `shop_items` for real reward
  artwork, and real audio files (`audio_url` on `lessons`) for listening
  exercises instead of the text-description placeholder used in demo mode.
