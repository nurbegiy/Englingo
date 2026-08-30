-- Run this ONCE if you already ran schema.sql / functions.sql before this
-- update. Self-study should allow the same category to be practiced many
-- times a day, earning XP every time — the old version blocked all XP
-- after the first completion of the day per category+level. This patch:
--   1. Drops the "one attempt per day" uniqueness constraint.
--   2. Replaces complete_practice() with a version that only blocks a
--      literal double-submit (same category+level within 4 seconds).
-- Safe to re-run.

alter table quiz_attempts drop constraint if exists quiz_attempts_user_id_category_level_attempt_date_key;

create or replace function complete_practice(
  -- text[], not uuid[]: lesson content ids come from the app's built-in
  -- question bank (e.g. "r-a1-1"), never real DB uuids.
  p_category text, p_level text, p_correct integer, p_total integer, p_wrong_item_ids text[] default '{}'
) returns json language plpgsql security definer as $$
declare
  v_user uuid := auth.uid();
  v_base integer;
  v_earned integer;
  v_too_soon boolean;
  v_current integer;
  v_best integer;
  v_last date;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;

  -- Self-study is meant to be repeated many times a day and earn XP every
  -- time. The only guard here is a short cooldown against a literal
  -- double-submit (e.g. a duplicate network retry) — not a daily cap.
  select exists(
    select 1 from quiz_attempts
    where user_id = v_user and category = p_category and level = p_level
      and created_at > now() - interval '4 seconds'
  ) into v_too_soon;

  v_base := xp_for_level(p_level);
  v_earned := case when v_too_soon then 0 else round(v_base * greatest(0.4, p_correct::numeric / greatest(p_total, 1))) end;

  insert into quiz_attempts (user_id, category, level, correct, total) values (v_user, p_category, p_level, p_correct, p_total);

  select streak_current, streak_best, last_activity_date into v_current, v_best, v_last from profiles where id = v_user;

  if v_earned > 0 then
    insert into xp_transactions (user_id, amount, source) values (v_user, v_earned, p_category);

    if v_last is distinct from current_date then
      if v_last = current_date - 1 then v_current := v_current + 1; else v_current := 1; end if;
      v_best := greatest(v_best, v_current);
    end if;

    update profiles set xp = xp + v_earned, streak_current = v_current, streak_best = v_best, last_activity_date = current_date
    where id = v_user;
  end if;

  -- track wrong answers for spaced review
  if array_length(p_wrong_item_ids, 1) > 0 then
    insert into student_progress (user_id, question_id, last_result, attempts, needs_review)
    select v_user, unnest(p_wrong_item_ids), false, 1, true
    on conflict (user_id, question_id) do update
      set last_result = false, attempts = student_progress.attempts + 1, needs_review = true, updated_at = now();
  end if;

  return json_build_object('xp_awarded', v_earned, 'streak_current', v_current, 'streak_best', v_best, 'duplicate', v_too_soon);
end;
$$;
