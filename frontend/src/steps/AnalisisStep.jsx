import React, { useEffect, useState } from 'react'
import { Brain, Sparkles, PenLine, Heart, Lightbulb } from 'lucide-react'

const stages = [
  { icon: PenLine, label: 'Membaca goresan tulisanmu...', color: 'text-accent' },
  { icon: Heart, label: 'Memahami emosi dari tulisan...', color: 'text-success' },
  { icon: Brain, label: 'Menganalisis makna di balik kata...', color: 'text-warning' },
  { icon: Lightbulb, label: 'Menyusun rekomendasi untukmu...', color: 'text-accent' },
  { icon: Sparkles, label: 'Selesai! Sebentar lagi...', color: 'text-success' },
]

export default function AnalisisStep() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (current >= stages.length - 1) return
    const t = setTimeout(() => setCurrent(c => c + 1), 1200)
    return () => clearTimeout(t)
  }, [current])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10 px-6">
      <div className="text-center space-y-2">
        <Brain className="w-10 h-10 text-accent mx-auto animate-pulse" />
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Membaca tulisamu...
        </h1>
        <p className="text-text-muted text-sm">Hanya butuh beberapa detik</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {stages.map((s, i) => {
          const Icon = s.icon
          const isActive = i === current
          const isDone = i < current
          return (
            <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${
              isDone ? 'opacity-60' : isActive ? 'opacity-100' : 'opacity-25'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                isDone ? 'bg-success/20 text-success' :
                isActive ? 'bg-accent-soft text-accent animate-pulse' :
                'bg-accent-border/20 text-text-muted'
              }`}>
                {isDone ? '✓' : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-sm font-medium ${isDone ? 'text-text-secondary' : isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                {s.label}
              </span>
              {isActive && !isDone && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping ml-auto" />
              )}
            </div>
          )
        })}
      </div>

      <div className="w-full max-w-md bg-bg-card rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${((current + 1) / stages.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
