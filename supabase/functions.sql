-- SECURITY DEFINER functions: the client calls these via `supabase.rpc(...)`.
-- They run with elevated privileges so XP, streaks and purchases are always
-- computed and validated server-side — never trust values sent from the client.

create or replace function xp_for_level(p_level text) returns integer language sql immutable as $$
  select case p_level
    when 'A1' then 10 when 'A2' then 10
    when 'B1' then 15
    when 'B2' then 20 when 'C1' then 20
    when 'C2' then 25
    else 10
  end;
$$;

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

  update profiles set xp = xp - v_price where id = v_user;
  insert into shop_purchases (user_id, item_id) values (v_user, p_item_id);

  return json_build_object('ok', true, 'remaining_xp', v_xp - v_price);
end;
$$;

create or replace function join_group_by_code(p_code text) returns json language plpgsql security definer as $$
declare
  v_user uuid := auth.uid();
  v_group groups%rowtype;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;
  select * into v_group from groups where upper(code) = upper(p_code) and status = 'active';
  if v_group.id is null then return json_build_object('ok', false, 'reason', 'not_found'); end if;

  update profiles set group_id = v_group.id where id = v_user;
  insert into group_members (group_id, student_id) values (v_group.id, v_user) on conflict do nothing;

  return json_build_object('ok', true, 'group_id', v_group.id, 'group_name', v_group.name);
end;
$$;

-- Teacher registration code check. Store the real code only as a Supabase
-- secret / environment variable read inside an Edge Function — this SQL
-- function is a fallback that reads from a locked-down table instead of the
-- frontend bundle, so the code is never shipped in client source.
create table if not exists teacher_codes (
  code text primary key,
  active boolean not null default true
);
alter table teacher_codes enable row level security;
-- No select policy for anon/authenticated: only this function (security definer) can read it.

create or replace function verify_teacher_code(p_code text) returns boolean language sql security definer as $$
  select exists(select 1 from teacher_codes where code = p_code and active = true);
$$;
