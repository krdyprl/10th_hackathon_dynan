import React, { useState, useRef, useEffect } from 'react'
import { PenLine, Timer, RotateCcw, Sparkles } from 'lucide-react'
import { JournalCanvas } from '../components/JournalCanvas'

const prompts = [
  'Apa yang paling kamu syukuri hari ini?',
  'Satu hal yang membuatmu tersenyum...',
  'Apa yang sedang memberatkan pikiranmu?',
  'Tiga kata yang menggambarkan harimu...',
  'Apa yang kamu butuhkan saat ini?',
  'Satu hal yang ingin kamu lepaskan...',
]

export default function TulisStep({ onComplete, strokes, setStrokes, eraseCount, setEraseCount, durationSeconds, setDurationSeconds, isTimerActive, setIsTimerActive }) {
  const canvasRef = useRef(null)
  const [prompt, setPrompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)])
  const [showPrompt, setShowPrompt] = useState(true)

  useEffect(() => {
    if (strokes.length > 0 && !isTimerActive) setIsTimerActive(true)
  }, [strokes, isTimerActive])

  useEffect(() => {
    let interval
    if (isTimerActive) {
      interval = setInterval(() => setDurationSeconds(d => d + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive])

  return (
    <div className="flex flex-col min-h-[60vh] gap-4 px-4 md:px-8 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-soft border border-accent-border">
          <PenLine className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Ceritakan harimu...
        </h1>
      </div>

      {showPrompt && (
        <div className="p-4 bg-bg-card border border-accent-border rounded-2xl text-center">
          <Sparkles className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-text-secondary italic text-sm">{prompt}</p>
          <button
            onClick={() => { setPrompt(prompts[Math.floor(Math.random() * prompts.length)]); setShowPrompt(true) }}
            className="text-xs text-text-muted mt-2 underline cursor-pointer hover:text-text-secondary"
          >
            Ganti pertanyaan
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-xs text-accent mt-2 ml-4 underline cursor-pointer hover:text-accent-hover"
          >
            Tulis bebas
          </button>
        </div>
      )}

      <div className="flex-1 border border-accent-border rounded-2xl overflow-hidden bg-[#1a103f]">
        <JournalCanvas
          ref={canvasRef}
          onStrokeChange={setStrokes}
          onEraseCountChange={setEraseCount}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-text-muted">
          <span className="flex items-center gap-1 text-xs">
            <Timer className="w-3.5 h-3.5" />
            {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-xs">Goresan: {strokes.length}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { canvasRef.current?.clear(); setStrokes([]); setEraseCount(0); setDurationSeconds(0); setIsTimerActive(false) }}
            className="flex items-center gap-1.5 text-xs text-text-muted border border-accent-border px-3 py-2 rounded-xl hover:bg-bg-card cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Ulang
          </button>
        </div>
      </div>
    </div>
  )
}
