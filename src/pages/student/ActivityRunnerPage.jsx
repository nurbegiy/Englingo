import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, X, PartyPopper, Flame } from 'lucide-react'
import ListeningPrompt from '../../components/learning/ListeningPrompt.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { getLessonSet, completePractice, xpForLevel } from '../../lib/dataClient'

export default function ActivityRunnerPage() {
  const { category } = useParams()
  const { profile, refreshProfile } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const items = useMemo(
    () => getLessonSet(category, profile?.level || 'A1', profile?.id),
    [category, profile?.level, profile?.id],
  )
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongIds, setWrongIds] = useState([])
  const [finished, setFinished] = useState(false)
  const [summary, setSummary] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  if (!items.length) {
    return (
      <div className="h-screen w-screen flex items-center justify-center px-6">
        <Card className="p-8 text-center max-w-sm">
          <p className="text-sm text-muted mb-4">No content for this level yet.</p>
          <Button onClick={() => navigate('/app/learn')}>{t('common.close')}</Button>
        </Card>
      </div>
    )
  }

  const item = items[index]
  const progress = (index / items.length) * 100

  function choose(i) {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    const correct = i === item.answer
    if (correct) setCorrectCount((c) => c + 1)
    else setWrongIds((w) => [...w, item.id])
  }

  async function next() {
    if (index < items.length - 1) {
      setIndex((i) => i + 1)
      setSelected(null)
      setAnswered(false)
      return
    }
    if (submitting) return // guard against double-tap firing this twice
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await completePractice({
        userId: profile.id, category, level: profile.level,
        correct: correctCount, total: items.length, wrongItemIds: wrongIds,
      })
      setSummary(result)
      setFinished(true)
      await refreshProfile()
    } catch (e) {
      // Previously a failed request here just silently froze the "Mashq
      // tugadi" button with no feedback. Surface it and let them retry.
      setSubmitError(e?.message || 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (finished) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-paper px-6">
        <Card className="w-full max-w-sm p-8 text-center">
          <PartyPopper className="mx-auto text-accent mb-3" size={32} />
          <h2 className="font-display text-xl font-semibold mb-1">{t('practiceComplete')} 🎉</h2>
          <p className="text-sm text-muted mb-6">{t('correct')}: {correctCount}/{items.length}</p>
          <div className="flex items-center justify-center gap-6 mb-6">
            <div>
              <p className="font-display text-3xl font-semibold text-gold">+{summary?.xp_awarded ?? 0}</p>
              <p className="text-xs text-muted">{t('xp')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 font-display text-3xl font-semibold text-accent">
                <Flame size={22} className="fill-accent/20" /> {summary?.streak_current ?? profile.streak_current}
              </div>
              <p className="text-xs text-muted">{t('streakMaintained')}</p>
            </div>
          </div>
          {summary?.duplicate && (
            <p className="text-xs text-muted mb-4">Already practiced today — come back tomorrow for more XP.</p>
          )}
          <Button className="w-full" onClick={() => navigate('/app/learn')}>{t('home.continue')}</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-paper">
      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted font-medium shrink-0">{index + 1} / {items.length}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {item.text && (
            <Card className="p-4 mb-5 text-sm leading-relaxed text-muted">{item.text}</Card>
          )}
          {item.audioText && (
            <ListeningPrompt key={item.id} text={item.audioText} />
          )}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-medium leading-snug">{item.prompt}</h2>
            <span className="text-xs font-semibold text-gold shrink-0 ml-3">+{xpForLevel(profile.level)} XP</span>
          </div>
          <div className="space-y-3">
            {item.options.map((opt, i) => {
              let style = 'border-line hover:border-accent/50'
              if (answered && i === item.answer) style = 'border-accent bg-accent-soft text-accent'
              else if (answered && i === selected) style = 'border-danger bg-danger/10 text-danger'
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={`w-full flex items-center justify-between text-left px-5 py-3.5 rounded-2xl border transition text-sm font-medium ${style}`}
                >
                  {opt}
                  {answered && i === item.answer && <Check size={16} />}
                  {answered && i === selected && i !== item.answer && <X size={16} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="max-w-lg mx-auto">
          {submitError && (
            <p className="text-xs text-danger text-center mb-2">{t('common.error')} — {t('common.retry')}?</p>
          )}
          <Button className="w-full" disabled={!answered || submitting} onClick={next}>
            {submitting ? t('common.loading') : index < items.length - 1 ? t('home.continue') : t('practiceComplete')}
          </Button>
        </div>
      </div>
    </div>
  )
}
