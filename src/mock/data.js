// Demo/mock dataset — mirrors the Supabase schema shape so the app is fully
// browsable without live credentials. See supabase/schema.sql for the real schema.
import { generatedLessons } from './generatedLessons.js'

export const XP_BY_LEVEL = { A1: 10, A2: 10, B1: 15, B2: 20, C1: 20, C2: 25 }
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export let branches = [
  { id: 'b1', name: 'Samarkand Center', status: 'active', created_at: '2025-01-10' },
  { id: 'b2', name: 'Registan Center', status: 'active', created_at: '2025-02-14' },
  { id: 'b3', name: 'Siyob Center', status: 'active', created_at: '2025-03-02' },
  { id: 'b4', name: 'Urgut Center', status: 'active', created_at: '2025-04-20' },
]

export let groups = [
  { id: 'g1', name: 'A2 — 14:00', branch_id: 'b1', teacher_id: 't1', code: 'A2X72K', level: 'A2' },
  { id: 'g2', name: 'B1 — 16:30', branch_id: 'b1', teacher_id: 't1', code: 'B1K90P', level: 'B1' },
  { id: 'g3', name: 'A1 — 10:00', branch_id: 'b2', teacher_id: 't2', code: 'A1M41Q', level: 'A1' },
]

export let profiles = [
  {
    id: 'u1', role: 'student', display_name: 'Ali Karimov', username: 'ali_k', branch_id: 'b1',
    group_id: 'g1', level: 'A2', xp: 2450, streak_current: 7, streak_best: 21, avatar_seed: 'ali',
    status: 'active', badges: ['first_week', 'grammar_star'],
  },
  {
    id: 'u2', role: 'student', display_name: 'Aziz Yusupov', username: 'aziz_y', branch_id: 'b1',
    group_id: 'g1', level: 'A2', xp: 2120, streak_current: 3, streak_best: 15, avatar_seed: 'aziz',
    status: 'active', badges: ['first_week'],
  },
  {
    id: 'u3', role: 'student', display_name: 'Muhammad Tosh', username: 'muhammad_t', branch_id: 'b1',
    group_id: 'g1', level: 'A1', xp: 1980, streak_current: 12, streak_best: 30, avatar_seed: 'muhammad',
    status: 'active', badges: ['streak_30', 'vocab_master'],
  },
  {
    id: 'u4', role: 'student', display_name: 'Dilnoza Rashidova', username: 'dilnoza_r', branch_id: 'b2',
    group_id: 'g3', level: 'B1', xp: 3210, streak_current: 5, streak_best: 40, avatar_seed: 'dilnoza',
    status: 'active', badges: ['streak_30', 'reading_pro', 'grammar_star'],
  },
  {
    id: 'demo-student', role: 'student', display_name: 'Siz (Demo)', username: 'demo_student', branch_id: 'b1',
    group_id: 'g1', level: 'A2', xp: 640, streak_current: 4, streak_best: 9, avatar_seed: 'demo',
    status: 'active', badges: ['first_week'],
  },
  { id: 't1', role: 'teacher', display_name: 'Nodira Egamova', username: 'nodira_t', branch_id: 'b1', status: 'active' },
  { id: 't2', role: 'teacher', display_name: 'Sardor Aliyev', username: 'sardor_t', branch_id: 'b2', status: 'active' },
  { id: 'admin1', role: 'admin', display_name: 'Super Admin', username: 'super_admin', status: 'active' },
]

export let follows = [
  { follower_id: 'demo-student', following_id: 'u1' },
  { follower_id: 'u2', following_id: 'demo-student' },
]

// ---- Learning content ----
// Large template/rule-generated bank (960 items: vocabulary, grammar,
// listening, reading x 6 CEFR levels) so practice sessions don't repeat the
// same handful of questions. See generatedLessons.js.
export const lessons = generatedLessons

// Placement test — mixed pool across skills/levels
export const placementQuestions = [
  { id: 'p1', level: 'A1', prompt: 'She ___ a teacher.', options: ['am', 'is', 'are', 'be'], answer: 1 },
  { id: 'p2', level: 'A1', prompt: 'What does "big" mean?', options: ['small', 'large', 'fast', 'slow'], answer: 1 },
  { id: 'p3', level: 'A2', prompt: 'I ___ my homework yesterday.', options: ['do', 'did', 'done', 'doing'], answer: 1 },
  { id: 'p4', level: 'A2', prompt: 'Can I ___ your pen?', options: ['borrow', 'lend', 'owe', 'rent'], answer: 0 },
  { id: 'p5', level: 'B1', prompt: 'By next year, I ___ my studies.', options: ['will finish', 'will have finished', 'finish', 'finished'], answer: 1 },
  { id: 'p6', level: 'B1', prompt: 'What does "achieve" mean?', options: ['reach a goal', 'leave a place', 'buy something', 'forget'], answer: 0 },
  { id: 'p7', level: 'B2', prompt: 'If I ___ known, I would have helped.', options: ['have', 'had', 'has', 'having'], answer: 1 },
  { id: 'p8', level: 'B2', prompt: 'What does "reluctant" mean?', options: ['eager', 'unwilling', 'careful', 'confident'], answer: 1 },
  { id: 'p9', level: 'C1', prompt: 'Rarely ___ such dedication.', options: ['I have seen', 'have I seen', 'I saw', 'did I see'], answer: 1 },
  { id: 'p10', level: 'C1', prompt: 'What does "ambiguous" mean?', options: ['clear', 'having more than one meaning', 'friendly', 'quick'], answer: 1 },
  { id: 'p11', level: 'C2', prompt: 'Had it not been for his help, the project ___ failed.', options: ['would', 'would have', 'will have', 'had'], answer: 1 },
  { id: 'p12', level: 'C2', prompt: 'What does "ephemeral" mean?', options: ['lasting a very short time', 'permanent', 'expensive', 'complicated'], answer: 0 },
]

export let shopItems = [
  { id: 's1', name: 'Golden Frame', category: 'frame', price: 1000, description: 'A shining gold border for your avatar.' },
  { id: 's2', name: 'Silver Frame', category: 'frame', price: 500, description: 'A polished silver border.' },
  { id: 's3', name: 'Streak Shield', category: 'streak', price: 300, description: 'Protects your streak for one missed day.' },
  { id: 's4', name: 'Night Owl Badge', category: 'badge', price: 200, description: 'For late-night learners.' },
  { id: 's5', name: 'Bookworm Badge', category: 'badge', price: 250, description: 'Awarded to avid readers.' },
  { id: 's6', name: 'Confetti Burst', category: 'cosmetic', price: 400, description: 'Celebrate every level-up in style.' },
]

export let shopPurchases = [
  { id: 'sp1', user_id: 'demo-student', item_id: 's4', purchased_at: '2026-08-10' },
]

export let challenges = [
  { id: 'c1', group_id: 'g1', title: "Bugungi maqsad: 3 ta mashq bajaring", target: 3, type: 'practices', created_by: 't1' },
]

export let xpTransactions = []
export let quizAttempts = []
export let wrongAnswers = []

export const platformSettings = {
  name: 'Lingua Track',
  logo_url: null,
  accent_color: 'emerald',
  default_language: 'uz',
}

export const TEACHER_CODE = 'TEACH-2026-SMD'
