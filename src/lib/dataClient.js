// Data access facade.
// Every exported function checks `isDemoMode` and either calls Supabase
// (following the schema in supabase/schema.sql) or reads/writes the local
// mock store in src/mock/data.js so the app fully works with `npm run dev`
// even without Supabase credentials configured.

import { supabase, isDemoMode } from './supabase'
import * as mock from '../mock/data'

const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`
const todayStr = () => new Date().toISOString().slice(0, 10)

// ---------------- Branches ----------------
export async function listBranches() {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('branches').select('*').eq('status', 'active').order('name')
    if (error) throw error
    return data
  }
  return mock.branches.filter((b) => b.status === 'active')
}

// ---------------- Profiles ----------------
export async function getProfile(userId) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) throw error
    return data
  }
  return mock.profiles.find((p) => p.id === userId) || null
}

export async function getProfileByUsername(username) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (error) throw error
    return data
  }
  return mock.profiles.find((p) => p.username === username) || null
}

export async function searchProfiles(query) {
  if (!isDemoMode) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_seed, level, xp')
      .eq('role', 'student')
      .ilike('display_name', `%${query}%`)
      .limit(20)
    if (error) throw error
    return data
  }
  const q = query.trim().toLowerCase()
  if (!q) return []
  return mock.profiles.filter((p) => p.role === 'student' && p.display_name.toLowerCase().includes(q))
}

// ---------------- Placement test ----------------
export function getPlacementQuestions() {
  return mock.placementQuestions
}

export function scorePlacement(answers) {
  // answers: { questionId: selectedIndex }
  const byLevel = {}
  mock.placementQuestions.forEach((q) => {
    byLevel[q.level] = byLevel[q.level] || { correct: 0, total: 0 }
    byLevel[q.level].total += 1
    if (answers[q.id] === q.answer) byLevel[q.level].correct += 1
  })
  // Deterministic rule: walk levels from A1, stop where accuracy drops below 60%
  let estimated = 'A1'
  for (const level of mock.LEVELS) {
    const s = byLevel[level]
    if (!s) continue
    const acc = s.correct / s.total
    if (acc >= 0.6) estimated = level
    else break
  }
  return { estimated, byLevel }
}

export async function submitPlacementResult(userId, estimatedLevel) {
  if (!isDemoMode) {
    const { error } = await supabase.from('profiles').update({ level: estimatedLevel }).eq('id', userId)
    if (error) throw error
    return
  }
  const p = mock.profiles.find((x) => x.id === userId)
  if (p) p.level = estimatedLevel
}

// ---------------- Learning content ----------------
function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function shuffleOptions(item) {
  if (!item.options) return item
  const idxs = shuffleArray(item.options.map((_, i) => i))
  return { ...item, options: idxs.map((i) => item.options[i]), answer: idxs.indexOf(item.answer) }
}

const SESSION_SIZE = 10

// Draws a fresh random subset AND a fresh random option order every single
// time this is called — every practice session looks different, even for
// the same category+level, instead of the same fixed handful of questions.
export function getLessonSet(category, level) {
  const pool = mock.lessons[category]?.[level] || []
  if (pool.length === 0) return []
  const picked = shuffleArray(pool).slice(0, Math.min(SESSION_SIZE, pool.length))
  return picked.map(shuffleOptions)
}

export function xpForLevel(level) {
  return mock.XP_BY_LEVEL[level] || 10
}

// Light anti-spam guard only (not a daily cap): blocks literal instant
// double-submits (e.g. a duplicate network retry within a couple seconds),
// not genuine repeated self-study sessions — those are meant to earn XP
// every time, since students may want to practice the same category many
// times a day.
const MIN_MS_BETWEEN_ATTEMPTS = 4000
function tooSoonSinceLastAttempt(userId, category, level) {
  const attempts = mock.quizAttempts.filter((a) => a.user_id === userId && a.category === category && a.level === level)
  if (attempts.length === 0) return false
  const last = attempts[attempts.length - 1]
  return Date.now() - (last.ts || 0) < MIN_MS_BETWEEN_ATTEMPTS
}

export async function completePractice({ userId, category, level, correct, total, wrongItemIds = [] }) {
  const baseXp = xpForLevel(level)
  const earned = Math.round(baseXp * Math.max(0.4, correct / total))

  if (!isDemoMode) {
    // Real implementation: call a Postgres RPC (e.g. `award_xp`) that performs
    // the duplicate-completion check and XP insert atomically & server-side,
    // since XP must never be trusted from the client.
    const { data, error } = await supabase.rpc('complete_practice', {
      p_category: category,
      p_level: level,
      p_correct: correct,
      p_total: total,
      p_wrong_item_ids: wrongItemIds,
    })
    if (error) throw error
    return data // { xp_awarded, streak_current, streak_best }
  }

  const dup = tooSoonSinceLastAttempt(userId, category, level)
  const xpAwarded = dup ? 0 : earned

  mock.quizAttempts.push({ id: uid('qa'), user_id: userId, category, level, correct, total, date: todayStr(), ts: Date.now() })
  wrongItemIds.forEach((itemId) => mock.wrongAnswers.push({ id: uid('wa'), user_id: userId, item_id: itemId, category, resolved: false }))

  const profile = mock.profiles.find((p) => p.id === userId)
  let streakResult = { current: profile?.streak_current || 0, best: profile?.streak_best || 0 }
  if (profile) {
    if (xpAwarded > 0) {
      profile.xp += xpAwarded
      mock.xpTransactions.push({ id: uid('xp'), user_id: userId, amount: xpAwarded, source: category, date: todayStr() })
      if (profile._lastActivityDate !== todayStr()) {
        profile.streak_current = (profile._lastActivityDate === yesterdayStr()) ? profile.streak_current + 1 : 1
        profile.streak_best = Math.max(profile.streak_best, profile.streak_current)
        profile._lastActivityDate = todayStr()
      }
      streakResult = { current: profile.streak_current, best: profile.streak_best }
    }
  }
  return { xp_awarded: xpAwarded, streak_current: streakResult.current, streak_best: streakResult.best, duplicate: dup }
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function getReviewItems(userId, category) {
  return mock.wrongAnswers.filter((w) => w.user_id === userId && w.category === category && !w.resolved)
}

// ---------------- Leaderboards ----------------
export async function getLeaderboard(scope, { branchId, groupId } = {}) {
  if (!isDemoMode) {
    let query = supabase.from('profiles').select('id, display_name, username, avatar_seed, xp, level').eq('role', 'student').order('xp', { ascending: false }).limit(50)
    if (scope === 'branch' && branchId) query = query.eq('branch_id', branchId)
    if (scope === 'group' && groupId) query = query.eq('group_id', groupId)
    const { data, error } = await query
    if (error) throw error
    return data
  }
  let list = mock.profiles.filter((p) => p.role === 'student')
  if (scope === 'branch' && branchId) list = list.filter((p) => p.branch_id === branchId)
  if (scope === 'group' && groupId) list = list.filter((p) => p.group_id === groupId)
  return [...list].sort((a, b) => b.xp - a.xp)
}

// ---------------- Shop ----------------
export async function listShopItems() {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('shop_items').select('*').eq('active', true).order('price')
    if (error) throw error
    return data
  }
  return mock.shopItems
}

export async function listPurchases(userId) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('shop_purchases').select('item_id').eq('user_id', userId)
    if (error) throw error
    return data.map((d) => d.item_id)
  }
  return mock.shopPurchases.filter((p) => p.user_id === userId).map((p) => p.item_id)
}

export async function purchaseItem(userId, itemId) {
  if (!isDemoMode) {
    // Real implementation: RPC that checks balance & prevents duplicate
    // purchases atomically inside a Postgres transaction / Edge Function.
    const { data, error } = await supabase.rpc('purchase_shop_item', { p_item_id: itemId })
    if (error) throw error
    return data
  }
  const item = mock.shopItems.find((i) => i.id === itemId)
  const profile = mock.profiles.find((p) => p.id === userId)
  if (!item || !profile) throw new Error('Not found')
  const owned = mock.shopPurchases.some((p) => p.user_id === userId && p.item_id === itemId)
  if (owned) return { ok: false, reason: 'already_owned' }
  if (profile.xp < item.price) return { ok: false, reason: 'insufficient_xp' }
  profile.xp -= item.price
  mock.shopPurchases.push({ id: uid('sp'), user_id: userId, item_id: itemId, purchased_at: todayStr() })
  return { ok: true, remaining_xp: profile.xp }
}

// ---------------- Groups / teacher ----------------
export async function getTeacherGroups(teacherId) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('groups').select('*').eq('teacher_id', teacherId)
    if (error) throw error
    return data
  }
  return mock.groups.filter((g) => g.teacher_id === teacherId)
}

export async function getGroupMembers(groupId) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('profiles').select('*').eq('group_id', groupId).order('xp', { ascending: false })
    if (error) throw error
    return data
  }
  return mock.profiles.filter((p) => p.group_id === groupId).sort((a, b) => b.xp - a.xp)
}

function generateGroupCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function createGroup({ teacherId, branchId, name, level }) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('groups').insert({ teacher_id: teacherId, branch_id: branchId, name, level, code: generateGroupCode() }).select().single()
    if (error) throw error
    return data
  }
  const group = { id: uid('g'), name, branch_id: branchId, teacher_id: teacherId, code: generateGroupCode(), level, status: 'active' }
  mock.groups.push(group)
  return group
}

export async function joinGroupByCode(userId, code) {
  if (!isDemoMode) {
    const { data, error } = await supabase.rpc('join_group_by_code', { p_code: code })
    if (error) throw error
    return data
  }
  const group = mock.groups.find((g) => g.code.toUpperCase() === code.trim().toUpperCase())
  if (!group) return { ok: false, reason: 'not_found' }
  const profile = mock.profiles.find((p) => p.id === userId)
  if (profile) profile.group_id = group.id
  return { ok: true, group }
}

export async function listGroupChallenges(groupId) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('challenges').select('*').eq('group_id', groupId)
    if (error) throw error
    return data
  }
  return mock.challenges.filter((c) => c.group_id === groupId)
}

export async function createChallenge({ groupId, teacherId, title, target, type }) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('challenges').insert({ group_id: groupId, created_by: teacherId, title, target, type }).select().single()
    if (error) throw error
    return data
  }
  const c = { id: uid('c'), group_id: groupId, created_by: teacherId, title, target, type }
  mock.challenges.push(c)
  return c
}

// ---------------- Follows / social ----------------
export async function isFollowing(followerId, followingId) {
  if (!isDemoMode) {
    const { data } = await supabase.from('follows').select('*').eq('follower_id', followerId).eq('following_id', followingId).maybeSingle()
    return !!data
  }
  return mock.follows.some((f) => f.follower_id === followerId && f.following_id === followingId)
}

export async function toggleFollow(followerId, followingId) {
  if (!isDemoMode) {
    const already = await isFollowing(followerId, followingId)
    if (already) {
      await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
      return false
    }
    await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId })
    return true
  }
  const idx = mock.follows.findIndex((f) => f.follower_id === followerId && f.following_id === followingId)
  if (idx >= 0) {
    mock.follows.splice(idx, 1)
    return false
  }
  mock.follows.push({ follower_id: followerId, following_id: followingId })
  return true
}

export async function getFollowCounts(userId) {
  if (!isDemoMode) {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ])
    return { followers: followers || 0, following: following || 0 }
  }
  return {
    followers: mock.follows.filter((f) => f.following_id === userId).length,
    following: mock.follows.filter((f) => f.follower_id === userId).length,
  }
}

// ---------------- Admin ----------------
export async function getAdminStats() {
  if (!isDemoMode) {
    const [students, teachers, branchesRes, groupsRes, xpRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      // Only count active branches/groups so deactivating one is reflected immediately.
      supabase.from('branches').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('groups').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('xp').eq('role', 'student'),
    ])
    const totalXp = (xpRes.data || []).reduce((sum, p) => sum + (p.xp || 0), 0)
    return {
      totalStudents: students.count || 0,
      totalTeachers: teachers.count || 0,
      totalBranches: branchesRes.count || 0,
      totalGroups: groupsRes.count || 0,
      totalXp,
    }
  }
  return {
    totalStudents: mock.profiles.filter((p) => p.role === 'student').length,
    totalTeachers: mock.profiles.filter((p) => p.role === 'teacher').length,
    totalBranches: mock.branches.filter((b) => b.status === 'active').length,
    totalGroups: mock.groups.filter((g) => (g.status || 'active') === 'active').length,
    totalXp: mock.profiles.reduce((sum, p) => sum + (p.xp || 0), 0),
  }
}

export async function listStudents() {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student').order('xp', { ascending: false })
    if (error) throw error
    return data
  }
  return mock.profiles.filter((p) => p.role === 'student')
}

export async function listTeachers() {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'teacher')
    if (error) throw error
    return data
  }
  return mock.profiles.filter((p) => p.role === 'teacher')
}

export async function listAllGroups() {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('groups').select('*')
    if (error) throw error
    return data
  }
  return mock.groups
}

export async function toggleUserStatus(userId) {
  if (!isDemoMode) {
    const { data: current } = await supabase.from('profiles').select('status').eq('id', userId).single()
    const next = current.status === 'active' ? 'blocked' : 'active'
    await supabase.from('profiles').update({ status: next }).eq('id', userId)
    return next
  }
  const p = mock.profiles.find((x) => x.id === userId)
  if (!p) return null
  p.status = p.status === 'active' ? 'blocked' : 'active'
  return p.status
}

// Admin branch management sees every branch (active + inactive) so a
// deactivated branch doesn't just silently disappear with no way back.
export async function listAllBranches() {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('branches').select('*').order('name')
    if (error) throw error
    return data
  }
  return [...mock.branches]
}

export async function createBranch(name) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('branches').insert({ name, status: 'active' }).select().single()
    if (error) throw error
    return data
  }
  const b = { id: uid('b'), name, status: 'active', created_at: todayStr() }
  mock.branches.push(b)
  return b
}

export async function renameBranch(id, name) {
  if (!isDemoMode) {
    const { error } = await supabase.from('branches').update({ name }).eq('id', id)
    if (error) throw error
    return
  }
  const b = mock.branches.find((x) => x.id === id)
  if (b) b.name = name
}

// Soft delete: a branch with students/teachers/groups can't be hard-deleted
// (foreign keys), so "delete" toggles status instead. toggleBranchStatus
// flips it back and forth so an accidental deactivation is recoverable.
export async function deactivateBranch(id) {
  if (!isDemoMode) {
    const { error } = await supabase.from('branches').update({ status: 'inactive' }).eq('id', id)
    if (error) throw error
    return
  }
  const b = mock.branches.find((x) => x.id === id)
  if (b) b.status = 'inactive'
}

export async function toggleBranchStatus(id) {
  if (!isDemoMode) {
    const { data: current, error: readErr } = await supabase.from('branches').select('status').eq('id', id).single()
    if (readErr) throw readErr
    const next = current.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('branches').update({ status: next }).eq('id', id)
    if (error) throw error
    return next
  }
  const b = mock.branches.find((x) => x.id === id)
  if (!b) return null
  b.status = b.status === 'active' ? 'inactive' : 'active'
  return b.status
}

// ---------------- Admin: group management ----------------
export async function renameGroup(id, patch) {
  if (!isDemoMode) {
    const { error } = await supabase.from('groups').update(patch).eq('id', id)
    if (error) throw error
    return
  }
  const g = mock.groups.find((x) => x.id === id)
  if (g) Object.assign(g, patch)
}

export async function toggleGroupStatus(id) {
  if (!isDemoMode) {
    const { data: current, error: readErr } = await supabase.from('groups').select('status').eq('id', id).single()
    if (readErr) throw readErr
    const next = current.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('groups').update({ status: next }).eq('id', id)
    if (error) throw error
    return next
  }
  const g = mock.groups.find((x) => x.id === id)
  if (!g) return null
  g.status = (g.status || 'active') === 'active' ? 'inactive' : 'active'
  return g.status
}

// Admin shop management sees every item (active + inactive), unlike the
// student-facing listShopItems() which only shows purchasable ones.
export async function listAdminShopItems() {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('shop_items').select('*').order('price')
    if (error) throw error
    return data
  }
  return [...mock.shopItems]
}

export async function upsertShopItem(item) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('shop_items').upsert(item).select().single()
    if (error) throw error
    return data
  }
  if (item.id) {
    const existing = mock.shopItems.find((i) => i.id === item.id)
    Object.assign(existing, item)
    return existing
  }
  const created = { ...item, id: uid('s'), active: true }
  mock.shopItems.push(created)
  return created
}

// Soft delete for shop items too — purchases reference item_id, so a hard
// delete would fail (or orphan) once anyone has bought the item.
export async function toggleShopItemStatus(id) {
  if (!isDemoMode) {
    const { data: current, error: readErr } = await supabase.from('shop_items').select('active').eq('id', id).single()
    if (readErr) throw readErr
    const next = !current.active
    const { error } = await supabase.from('shop_items').update({ active: next }).eq('id', id)
    if (error) throw error
    return next
  }
  const i = mock.shopItems.find((x) => x.id === id)
  if (!i) return null
  i.active = i.active === false ? true : false
  return i.active
}

// ---------------- Platform settings ----------------
export async function getPlatformSettings() {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('platform_settings').select('*').eq('id', true).single()
    if (error) throw error
    return data
  }
  return { ...mock.platformSettings }
}

export async function updatePlatformSettings(patch) {
  if (!isDemoMode) {
    const { data, error } = await supabase.from('platform_settings').update(patch).eq('id', true).select().single()
    if (error) throw error
    return data
  }
  Object.assign(mock.platformSettings, patch)
  return { ...mock.platformSettings }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ---------------- Image uploads (logo / avatars) ----------------
// Real mode: Supabase Storage (see supabase/patch_storage.sql for buckets +
// policies). Demo mode: converted to a data URL and kept in memory for the
// session, since there is no backing storage without credentials.
export async function uploadLogo(file) {
  if (!isDemoMode) {
    const ext = file.name.split('.').pop()
    const path = `logo-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('branding').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('branding').getPublicUrl(path)
    await updatePlatformSettings({ logo_url: data.publicUrl })
    return data.publicUrl
  }
  const dataUrl = await fileToDataUrl(file)
  await updatePlatformSettings({ logo_url: dataUrl })
  return dataUrl
}

export async function uploadAvatar(userId, file) {
  if (!isDemoMode) {
    const ext = file.name.split('.').pop()
    const path = `${userId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updErr } = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId)
    if (updErr) throw updErr
    return data.publicUrl
  }
  const dataUrl = await fileToDataUrl(file)
  const p = mock.profiles.find((x) => x.id === userId)
  if (p) p.avatar_url = dataUrl
  return dataUrl
}
