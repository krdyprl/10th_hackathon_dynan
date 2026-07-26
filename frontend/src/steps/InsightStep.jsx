import React from 'react'
import { Sparkles, Brain, Heart, Lightbulb, Volume2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function InsightStep() {
  const { analysisResult, radarData, moodTrend } = useApp()
  const r = analysisResult

  if (!r) return (
    <div className="flex items-center justify-center min-h-[60vh] text-text-muted">
      <p className="text-sm">Belum ada analisis. Selesaikan langkah sebelumnya.</p>
    </div>
  )

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''))
      u.lang = 'id-ID'
      u.rate = 0.9
      window.speechSynthesis.speak(u)
    }
  }

  return (
    <div className="space-y-5 px-4 md:px-8 py-4">
      <div className="text-center space-y-2">
        <Sparkles className="w-8 h-8 text-accent mx-auto" />
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Apa yang Ditemukan
        </h1>
      </div>

      {/* Mood vs AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 bg-bg-card border border-accent-border rounded-2xl text-center">
          <Heart className="w-5 h-5 text-danger mx-auto mb-1" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Kata AI</span>
          <div className="text-2xl font-bold text-text-primary mt-1">{r.mood_score}/100</div>
          <div className="w-full bg-bg-surface rounded-full h-2 mt-2">
            <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${r.mood_score || 0}%` }} />
          </div>
          <span className="text-xs text-text-muted mt-1 block">{r.sentiment_label}</span>
        </div>
        <div className="p-4 bg-bg-card border border-accent-border rounded-2xl text-center">
          <Brain className="w-5 h-5 text-warning mx-auto mb-1" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Tingkat Stres</span>
          <div className="text-2xl font-bold text-warning mt-1">{r.stress_score}/100</div>
          <div className="w-full bg-bg-surface rounded-full h-2 mt-2">
            <div className="bg-warning h-2 rounded-full transition-all" style={{ width: `${r.stress_score || 0}%` }} />
          </div>
          <span className="text-xs text-text-muted mt-1 block">
            {r.stress_score >= 70 ? 'Perlu perhatian' : r.stress_score >= 40 ? 'Sedang' : 'Stabil'}
          </span>
        </div>
      </div>

      {/* Insight card */}
      <div className="p-5 bg-bg-card border border-accent-border rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-accent uppercase">Wawasan</span>
          <button onClick={() => speak(r.handwriting_insights + '. ' + r.recommendations)} className="text-text-muted hover:text-accent cursor-pointer">
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{r.handwriting_insights}</p>
        {r.mood_stress_correlation && (
          <div className="pt-2 border-t border-accent-border">
            <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">Korelasi</span>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">{r.mood_stress_correlation}</p>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="p-5 bg-accent-soft border border-accent-border rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-warning" />
          <span className="text-[10px] font-semibold tracking-wider text-accent uppercase">Rekomendasi</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{r.recommendations}</p>
        <button onClick={() => speak(r.recommendations)} className="flex items-center gap-1.5 text-xs text-text-muted mt-3 hover:text-accent cursor-pointer">
          <Volume2 className="w-3.5 h-3.5" /> Dengarkan
        </button>
      </div>
    </div>
  )
}
