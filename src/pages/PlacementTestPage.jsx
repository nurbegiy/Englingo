import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlacementQuestions, scorePlacement, submitPlacementResult } from '../lib/dataClient'
import { useAuth } from '../hooks/useAuth.jsx'
import { useI18n } from '../hooks/useI18n.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'

export default function PlacementTestPage() {
  const { t } = useI18n()
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const questions = useMemo(() => getPlacementQuestions(), [])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const q = questions[index]
  const progress = ((index) / questions.length) * 100

  function select(optionIdx) {
    setAnswers((a) => ({ ...a, [q.id]: optionIdx }))
  }

  async function next() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1)
    } else {
      const scored = scorePlacement({ ...answers })
      setResult(scored)
      setSaving(true)
      await submitPlacementResult(user.id, scored.estimated)
      await refreshProfile()
      setSaving(false)
    }
  }

  if (result) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-paper px-6">
        <Card className="w-full max-w-md p-8 text-center">
          <p className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">{t('placement.result')}</p>
          <div className="font-display text-6xl font-semibold text-accent mb-6">{result.estimated}</div>
          <div className="space-y-2 mb-8 text-left">
            {Object.entries(result.byLevel).map(([level, s]) => (
              <div key={level} className="flex items-center justify-between text-sm">
                <span className="text-muted">{level}</span>
                <div className="flex-1 mx-3 h-1.5 rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${(s.correct / s.total) * 100}%` }} />
                </div>
                <span className="font-medium w-10 text-right">{s.correct}/{s.total}</span>
              </div>
            ))}
          </div>
          <Button className="w-full" disabled={saving} onClick={() => navigate('/app/home')}>
            {t('placement.start')}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-paper">
      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto">
          <p className="text-sm font-medium text-muted mb-2">{t('placement.question')} {index + 1} / {questions.length}</p>
          <div className="h-1.5 rounded-full bg-line overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <h2 className="font-display text-2xl font-medium mb-8 leading-snug">{q.prompt}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => select(i)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl border transition text-sm font-medium ${
                  answers[q.id] === i ? 'border-accent bg-accent-soft text-accent' : 'border-line hover:border-accent/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 pb-8">
        <div className="max-w-lg mx-auto">
          <Button className="w-full" disabled={answers[q.id] === undefined} onClick={next}>
            {index < questions.length - 1 ? 'Next' : t('placement.result')}
          </Button>
        </div>
      </div>
    </div>
  )
}
