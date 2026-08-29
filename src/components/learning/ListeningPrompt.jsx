import React, { useEffect, useState } from 'react'
import { Volume2, Eye, Loader2 } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'

// Plays the listening passage using the browser's built-in text-to-speech
// (no audio files needed) and keeps the transcript hidden until the learner
// explicitly asks to see it — this is a listening exercise, not a reading one.
export default function ListeningPrompt({ text }) {
  const { t } = useI18n()
  const [revealed, setRevealed] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setRevealed(false)
    setSpeaking(false)
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
    }
  }, [text])

  function play() {
    if (!supported) return
    window.speechSynthesis.cancel()
    const clean = text.replace(/^"|"$/g, '')
    const utter = new SpeechSynthesisUtterance(clean)
    utter.lang = 'en-US'
    utter.rate = 0.92
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }

  return (
    <Card className="p-4 mb-5 flex items-center gap-3">
      <button
        type="button"
        onClick={play}
        disabled={!supported}
        aria-label="Play audio"
        className="h-11 w-11 shrink-0 rounded-full bg-accent text-white flex items-center justify-center hover:brightness-95 active:brightness-90 transition disabled:opacity-50"
      >
        {speaking ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
      </button>
      <div className="flex-1 min-w-0 text-sm">
        {!supported ? (
          <span className="text-muted">Audio playback isn't supported in this browser.</span>
        ) : revealed ? (
          <span className="italic text-muted">{text}</span>
        ) : (
          <button type="button" onClick={() => setRevealed(true)} className="flex items-center gap-1.5 text-accent font-medium">
            <Eye size={14} /> {t('listening.showText', "Matnni ko'rish")}
          </button>
        )}
      </div>
    </Card>
  )
}
