-- Run this ONCE against your existing Supabase project (SQL editor, or
-- `supabase db push` if you fold it into a migration). Safe to re-run.
--
-- Fixes two bugs that made "Mashq tugadi" (finish practice) hang / silently
-- give 0 XP, and made purchases from the shop fail the same way:
--
-- BUG 1 — the profiles guard trigger blocked its own RPCs.
--   `prevent_self_privilege_escalation` (schema.sql) raises an exception any
--   time profiles.xp/role/status changes and the caller isn't an admin. But
--   complete_practice() and purchase_shop_item() are SECURITY DEFINER
--   functions that update profiles.xp on behalf of ordinary students — the
--   trigger has no way to tell "a trusted RPC did this" from "the student
--   tried to edit their own XP directly", so it blocked BOTH, and the whole
--   RPC call (and the enclosing transaction) failed every time XP was owed.
--   That's why the finish button looked unresponsive whenever a completion
--   would have earned XP, and why XP was never actually granted.
--
-- BUG 2 — wrong-answer IDs were sent as uuid[] but the app's lesson content
--   uses plain string ids (e.g. "r-a1-1"), which are not valid UUIDs. Any
--   session with at least one wrong answer made complete_practice() fail
--   with a "invalid input syntax for type uuid" error before it could do
--   anything else. This hit listening/reading hardest since those sections
--   only had one question, so a single wrong answer broke the finish step
--   every time.

-- ---- Fix 2: switch question-id tracking from uuid to text ----
alter table student_progress drop constraint if exists student_progress_question_id_fkey;
alter table student_progress alter column question_id type text using question_id::text;

-- ---- Fix 1: let trusted SECURITY DEFINER functions bypass the guard ----
-- The functions set a transaction-local flag right before touching
-- profiles; the trigger checks for that flag instead of assuming every
-- caller is either "admin" or "not to be trusted".
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

create or replace function complete_practice(
  p_category text, p_level text, p_correct integer, p_total integer, p_wrong_item_ids text[] default '{}'
) returns json language plpgsql security definer as $$
declare
  v_user uuid := auth.uid();
  v_base integer;
  v_earned integer;
  v_dup boolean;
  v_current integer;
  v_best integer;
  v_last date;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;

  -- one XP-earning attempt per category+level+day (unique constraint doubles as guard)
  select exists(
    select 1 from quiz_attempts where user_id = v_user and category = p_category and level = p_level and attempt_date = current_date
  ) into v_dup;

  v_base := xp_for_level(p_level);
  v_earned := case when v_dup then 0 else round(v_base * greatest(0.4, p_correct::numeric / greatest(p_total, 1))) end;

  if not v_dup then
    insert into quiz_attempts (user_id, category, level, correct, total) values (v_user, p_category, p_level, p_correct, p_total);
  end if;

  select streak_current, streak_best, last_activity_date into v_current, v_best, v_last from profiles where id = v_user;

  if v_earned > 0 then
    insert into xp_transactions (user_id, amount, source) values (v_user, v_earned, p_category);

    if v_last is distinct from current_date then
      if v_last = current_date - 1 then v_current := v_current + 1; else v_current := 1; end if;
      v_best := greatest(v_best, v_current);
    end if;

    perform set_config('app.bypass_profile_guard', 'true', true);
    update profiles set xp = xp + v_earned, streak_current = v_current, streak_best = v_best, last_activity_date = current_date
    where id = v_user;
  end if;

  -- track wrong answers for spaced review (question ids are plain text, not DB uuids)
  if array_length(p_wrong_item_ids, 1) > 0 then
    insert into student_progress (user_id, question_id, last_result, attempts, needs_review)
    select v_user, unnest(p_wrong_item_ids), false, 1, true
    on conflict (user_id, question_id) do update
      set last_result = false, attempts = student_progress.attempts + 1, needs_review = true, updated_at = now();
  end if;

  return json_build_object('xp_awarded', v_earned, 'streak_current', v_current, 'streak_best', v_best, 'duplicate', v_dup);
end;
$$;

create or replace function purchase_shop_item(p_item_id uuid) returns json language plpgsql security definer as $$
declare
  v_user uuid := auth.uid();
  v_price integer;
  v_xp integer;
  v_owned boolean;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;

  select price into v_price from shop_items where id = p_item_id and active = true;
  if v_price is null then return json_build_object('ok', false, 'reason', 'not_found'); end if;

  select exists(select 1 from shop_purchases where user_id = v_user and item_id = p_item_id) into v_owned;
  if v_owned then return json_build_object('ok', false, 'reason', 'already_owned'); end if;

  select xp into v_xp from profiles where id = v_user for update;
  if v_xp < v_price then return json_build_object('ok', false, 'reason', 'insufficient_xp'); end if;

  perform set_config('app.bypass_profile_guard', 'true', true);
  update profiles set xp = xp - v_price where id = v_user;
  insert into shop_purchases (user_id, item_id) values (v_user, p_item_id);

  return json_build_object('ok', true, 'remaining_xp', v_xp - v_price);
end;
$$;
