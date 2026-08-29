-- Demo seed data. Safe to re-run (uses stable names + upserts where sensible).
-- Note: profile rows require matching auth.users rows to exist first (create
-- these users via Supabase Auth, then insert their profiles below with the
-- real generated UUIDs). Branches, groups, and learning content can be
-- seeded independently.

insert into branches (name) values
  ('Samarkand Center'), ('Registan Center'), ('Siyob Center'), ('Urgut Center')
on conflict do nothing;

insert into teacher_codes (code) values ('TEACH-2026-SMD') on conflict do nothing;

insert into shop_items (name, description, category, price) values
  ('Golden Frame', 'A shining gold border for your avatar.', 'frame', 1000),
  ('Silver Frame', 'A polished silver border.', 'frame', 500),
  ('Streak Shield', 'Protects your streak for one missed day.', 'streak', 300),
  ('Night Owl Badge', 'For late-night learners.', 'badge', 200),
  ('Bookworm Badge', 'Awarded to avid readers.', 'badge', 250),
  ('Confetti Burst', 'Celebrate every level-up in style.', 'cosmetic', 400)
on conflict do nothing;

-- Example lesson + question + options for A2 vocabulary (repeat this shape
-- for every category/level combination; the app queries by category+level).
with l as (
  insert into lessons (category, level, title) values ('vocabulary', 'A2', 'Everyday verbs') returning id
), q as (
  insert into questions (lesson_id, prompt, question_type, order_index)
  select id, 'What does "borrow" mean?', 'choose_meaning', 1 from l returning id
)
insert into question_options (question_id, option_text, is_correct, order_index)
select q.id, opt, is_correct, ord from q,
  (values ('to give away', false, 0), ('to take and return later', true, 1), ('to buy', false, 2), ('to lose', false, 3)) as o(opt, is_correct, ord);

-- Repeat similar blocks for grammar / listening / reading and for A1..C2.
-- For local development, the frontend's demo mode (src/mock/data.js) already
-- ships a full A1–C2 content set across all four categories so you can
-- preview the UI before populating Supabase content.
