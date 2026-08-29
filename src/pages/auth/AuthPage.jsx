import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { listBranches } from '../../lib/dataClient'
import { GraduationCap, User2 } from 'lucide-react'

export default function AuthPage() {
  const { t } = useI18n()
  const { signIn, signUpStudent, signUpTeacher, isDemoMode, user } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState('student')
  const [mode, setModeState] = useState('signup') // signup | signin
  const [branches, setBranches] = useState([])
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', branchId: '', teacherCode: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    listBranches().then((b) => {
      setBranches(b)
      setForm((f) => ({ ...f, branchId: b[0]?.id || '' }))
    })
  }, [])

  useEffect(() => {
    if (user) navigate('/app/home', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn({ email: form.email, password: form.password })
        return
      }
      if (role === 'student') {
        const { needsPlacement } = await signUpStudent(form)
        navigate(needsPlacement ? '/placement-test' : '/app/home')
      } else {
        await signUpTeacher(form)
        navigate('/teacher/dashboard')
      }
    } catch (err) {
      setError(err.message === 'invalid_teacher_code' ? t('auth.invalidTeacherCode') : (err.message || t('common.error')))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout eyebrow="Educational Centers">
      <div className="mb-7">
        <h1 className="font-display text-2xl font-semibold mb-1">
          {mode === 'signup' ? t('auth.signUp') : t('auth.signIn')}
        </h1>
        <p className="text-sm text-muted">
          {mode === 'signup' ? t('auth.chooseBranch') : 'Welcome back'}
        </p>
      </div>

      <div className="flex bg-accent-soft/60 rounded-full p-1 mb-6">
        <button
          onClick={() => setRole('student')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition ${role === 'student' ? 'bg-surface shadow-soft text-accent' : 'text-muted'}`}
        >
          <User2 size={15} /> {t('auth.asStudent')}
        </button>
        <button
          onClick={() => setRole('teacher')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition ${role === 'teacher' ? 'bg-surface shadow-soft text-accent' : 'text-muted'}`}
        >
          <GraduationCap size={15} /> {t('auth.asTeacher')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <>
            <Field label={t('auth.fullName')} value={form.fullName} onChange={update('fullName')} required />
            <Field label={t('auth.username')} value={form.username} onChange={update('username')} required />
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">{t('auth.chooseBranch')}</label>
              <select
                value={form.branchId}
                onChange={update('branchId')}
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none"
              >
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </>
        )}
        <Field label={t('auth.email')} type="email" value={form.email} onChange={update('email')} required />
        <Field label={t('auth.password')} type="password" value={form.password} onChange={update('password')} required />
        {mode === 'signup' && role === 'teacher' && (
          <Field label={t('auth.teacherCode')} value={form.teacherCode} onChange={update('teacherCode')} required />
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={busy} className="w-full mt-2">
          {mode === 'signup' ? t('auth.createAccount') : t('auth.signIn')}
        </Button>
      </form>

      <button
        onClick={() => setModeState(mode === 'signup' ? 'signin' : 'signup')}
        className="w-full text-center text-sm text-accent font-medium mt-4"
      >
        {mode === 'signup' ? t('auth.haveAccount') : t('auth.noAccount')}
      </button>

      {isDemoMode && (
        <div className="mt-8 border-t border-line pt-5">
          <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Demo quick sign-in</p>
          <div className="flex flex-wrap gap-2">
            <DemoBtn id="demo-student" label="Student" onSignIn={signIn} />
            <DemoBtn id="t1" label="Teacher" onSignIn={signIn} />
            <DemoBtn id="admin1" label="Admin" onSignIn={signIn} />
          </div>
        </div>
      )}
    </AuthLayout>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted mb-1 block">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none"
      />
    </div>
  )
}

function DemoBtn({ id, label, onSignIn }) {
  return (
    <button
      type="button"
      onClick={() => onSignIn({ demoUserId: id })}
      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-line hover:border-accent hover:text-accent transition"
    >
      {label}
    </button>
  )
}
