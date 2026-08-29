import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import * as mock from '../mock/data'
import { getProfile } from '../lib/dataClient'

const AuthContext = createContext(null)
const DEMO_SESSION_KEY = 'lt_demo_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { id, email }
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    try {
      const p = await getProfile(userId)
      setProfile(p)
    } catch (e) {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let unsub = () => {}
    async function init() {
      if (isDemoMode) {
        const savedId = localStorage.getItem(DEMO_SESSION_KEY)
        if (savedId) {
          setUser({ id: savedId })
          await loadProfile(savedId)
        }
        setLoading(false)
        return
      }
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUser(data.session.user)
        await loadProfile(data.session.user.id)
      }
      setLoading(false)
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user || null)
        if (session?.user) await loadProfile(session.user.id)
        else setProfile(null)
      })
      unsub = () => sub.subscription.unsubscribe()
    }
    init()
    return () => unsub()
  }, [loadProfile])

  const signUpStudent = useCallback(async ({ fullName, username, email, password, branchId }) => {
    if (!isDemoMode) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      const userId = data.user.id
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId, role: 'student', display_name: fullName, username, branch_id: branchId,
        level: null, xp: 0, streak_current: 0, streak_best: 0, status: 'active',
      })
      if (profileError) throw profileError
      setUser(data.user)
      await loadProfile(userId)
      return { user: data.user, needsPlacement: true }
    }
    const id = `demo_${Date.now()}`
    const newProfile = {
      id, role: 'student', display_name: fullName, username, branch_id: branchId,
      group_id: null, level: null, xp: 0, streak_current: 0, streak_best: 0,
      avatar_seed: username, status: 'active', badges: [],
    }
    mock.profiles.push(newProfile)
    localStorage.setItem(DEMO_SESSION_KEY, id)
    setUser({ id })
    setProfile(newProfile)
    return { user: { id }, needsPlacement: true }
  }, [loadProfile])

  const signUpTeacher = useCallback(async ({ fullName, username, email, password, branchId, teacherCode }) => {
    if (!isDemoMode) {
      // Server-side check via the SECURITY DEFINER function — the real code
      // lives only in the `teacher_codes` table, never in frontend source.
      const { data: valid, error: codeError } = await supabase.rpc('verify_teacher_code', { p_code: teacherCode })
      if (codeError) throw codeError
      if (!valid) throw new Error('invalid_teacher_code')

      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      const userId = data.user.id
      await supabase.from('profiles').insert({
        id: userId, role: 'teacher', display_name: fullName, username, branch_id: branchId, status: 'active',
      })
      setUser(data.user)
      await loadProfile(userId)
      return { user: data.user }
    }
    if (teacherCode !== mock.TEACHER_CODE) {
      throw new Error('invalid_teacher_code')
    }
    const id = `demo_t_${Date.now()}`
    const newProfile = { id, role: 'teacher', display_name: fullName, username, branch_id: branchId, status: 'active' }
    mock.profiles.push(newProfile)
    localStorage.setItem(DEMO_SESSION_KEY, id)
    setUser({ id })
    setProfile(newProfile)
    return { user: { id } }
  }, [loadProfile])

  const signIn = useCallback(async ({ email, password, demoUserId }) => {
    if (!isDemoMode) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setUser(data.user)
      await loadProfile(data.user.id)
      return data.user
    }
    // Demo mode: sign in as one of the seeded accounts (no password check)
    const id = demoUserId || 'demo-student'
    localStorage.setItem(DEMO_SESSION_KEY, id)
    setUser({ id })
    await loadProfile(id)
    return { id }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    if (!isDemoMode) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem(DEMO_SESSION_KEY)
    }
    setUser(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id)
  }, [user, loadProfile])

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemoMode, signUpStudent, signUpTeacher, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
