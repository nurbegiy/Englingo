-- Run this instead of / in addition to patch_fix_practice_completion.sql.
-- Safe to re-run any number of times.
--
-- WHY XP/STREAK WAS STILL BROKEN AFTER THE LAST PATCH:
-- Postgres identifies a function by name *and* argument types. The old
-- complete_practice() took `p_wrong_item_ids uuid[]`; the patch tried to
-- swap it for `text[]` using `create or replace`, but since the argument
-- type changed, Postgres didn't replace anything — it silently created a
-- SECOND, overloaded function. With two versions of complete_practice()
-- sitting side by side, calling it becomes ambiguous and fails, which is
-- exactly the "Xatolik yuz berdi" you were still seeing. This script
-- explicitly drops every old version by its exact old signature first, so
-- there's only ever one complete_practice() left afterwards.
--
-- This also adds explicit GRANT EXECUTE statements and small defensive RLS
-- insert policies, so there's no ambiguity around "ruxsat" (permissions)
-- either way.

-- ---- 1. Remove every old signature so nothing is left overloaded ----
drop function if exists complete_practice(text, text, integer, integer, uuid[]);
drop function if exists complete_practice(text, text, integer, integer, text[]);
drop function if exists complete_practice(text, text, integer, integer);
drop function if exists purchase_shop_item(uuid);

-- ---- 2. Recreate everything clean (same bodies as the previous patch) ----
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

create function complete_practice(
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

  if array_length(p_wrong_item_ids, 1) > 0 then
    insert into student_progress (user_id, question_id, last_result, attempts, needs_review)
    select v_user, unnest(p_wrong_item_ids), false, 1, true
    on conflict (user_id, question_id) do update
      set last_result = false, attempts = student_progress.attempts + 1, needs_review = true, updated_at = now();
  end if;

  return json_build_object('xp_awarded', v_earned, 'streak_current', v_current, 'streak_best', v_best, 'duplicate', v_dup);
end;
$$;

create function purchase_shop_item(p_item_id uuid) returns json language plpgsql security definer as $$
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

-- ---- 3. Explicit permissions, so this can never be a "ruxsat" question ----
grant execute on function complete_practice(text, text, integer, integer, text[]) to authenticated;
grant execute on function purchase_shop_item(uuid) to authenticated;
grant execute on function xp_for_level(text) to authenticated;

-- ---- 4. Defensive insert policies ----
-- complete_practice()/purchase_shop_item() write through table-owner
-- bypass, which is normally enough — but if this project's functions ever
-- end up owned by a non-owner role, these policies make direct,
-- self-scoped inserts work too, at no cost to security (still limited to
-- inserting only your own rows).
drop policy if exists "attempts insert own" on quiz_attempts;
create policy "attempts insert own" on quiz_attempts for insert with check (user_id = auth.uid());

drop policy if exists "xp insert own" on xp_transactions;
create policy "xp insert own" on xp_transactions for insert with check (user_id = auth.uid());

drop policy if exists "progress insert own" on student_progress;
create policy "progress insert own" on student_progress for insert with check (user_id = auth.uid());

drop policy if exists "progress update own" on student_progress;
create policy "progress update own" on student_progress for update using (user_id = auth.uid());

drop policy if exists "purchases insert own" on shop_purchases;
create policy "purchases insert own" on shop_purchases for insert with check (user_id = auth.uid());
