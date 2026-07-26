import React, { useEffect, useState } from 'react'
import { BarChart3, Heart, Sparkles, Brain, Volume2, Clock } from 'lucide-react'
import { HandwritingRadarChart } from '../components/HandwritingRadarChart'
import { MoodTrendChart } from '../components/MoodTrendChart'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function LiterasiPage() {
  const { analysisResult, radarData, moodTrend, setMoodTrend } = useApp()
  const [historyRange, setHistoryRange] = useState(7)
  const [timeline, setTimeline] = useState([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [historyRange])

  useEffect(() => {
    fetchTimeline()
  }, [])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session ? { Authorization: `Bearer ${session.access_token}` } : {}
  }

  const fetchHistory = async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch(`http://localhost:8000/api/history?range=${historyRange}`, { headers })
      if (!res.ok) return
      const data = await res.json()
      if (data.entries?.length > 0) {
        const trends = data.entries.filter(e => e.type === 'journal').map(e => ({
          date: new Date(e.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
          mood: e.mood_score,
        }))
        if (analysisResult?.future_mood_prediction) {
          const p = analysisResult.future_mood_prediction
          trends.push({ date: 'H+1', mood: p[0] }, { date: 'H+2', mood: p[1] }, { date: 'H+3', mood: p[2] }, { date: 'H+4', mood: p[3] })
        }
        setMoodTrend(trends.length > 0 ? trends : moodTrend)
      }
    } catch {}
  }

  const fetchTimeline = async () => {
    setLoadingTimeline(true)
    try {
      const headers = await getHeaders()
      const res = await fetch('http://localhost:8000/api/history?range=30', { headers })
      if (!res.ok) return
      const data = await res.json()
      if (data.entries) {
        setTimeline(data.entries.sort((a, b) => new Date(b.date) - new Date(a.date)))
      }
    } catch {}
    setLoadingTimeline(false)
  }

  const stressLevel = (score) => {
    if (score == null) return { label: '-', color: 'var(--color-text-muted)' }
    if (score >= 70) return { label: 'Tinggi', color: 'var(--color-pilar-darurat)' }
    if (score >= 40) return { label: 'Sedang', color: 'var(--color-pilar-sehat)' }
    return { label: 'Rendah', color: 'var(--color-pilar-bantuan)' }
  }

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''))
      u.lang = 'id-ID'; u.rate = 0.9
      window.speechSynthesis.speak(u)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-literasi-soft)' }}>
          <BarChart3 className="w-5 h-5" style={{ color: 'var(--color-pilar-literasi)' }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Literasi & Wawasan</h1>
      </div>

      {/* Mood vs AI */}
      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl border text-center" style={{ borderColor: 'var(--color-pilar-literasi)', backgroundColor: 'var(--color-pilar-literasi-soft)' }}>
            <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-literasi)' }} />
            <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>Mood AI</span>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-pilar-literasi)' }}>{analysisResult.mood_score}/100</div>
            <div className="w-full rounded-full h-2 mt-2" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="h-full rounded-full" style={{ width: `${analysisResult.mood_score || 0}%`, backgroundColor: 'var(--color-pilar-literasi)' }} />
            </div>
            <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-muted)' }}>{analysisResult.sentiment_label}</span>
          </div>
          <div className="p-4 rounded-2xl border text-center" style={{ borderColor: 'var(--color-pilar-sehat)', backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
            <Brain className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-sehat)' }} />
            <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>Stress AI</span>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-pilar-sehat)' }}>{analysisResult.stress_score}/100</div>
            <div className="w-full rounded-full h-2 mt-2" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="h-full rounded-full" style={{ width: `${analysisResult.stress_score || 0}%`, backgroundColor: 'var(--color-pilar-sehat)' }} />
            </div>
            <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-muted)' }}>
              {analysisResult.stress_score >= 70 ? 'Perlu perhatian' : analysisResult.stress_score >= 40 ? 'Sedang' : 'Stabil'}
            </span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: 'var(--color-pilar-stres)' }}>Radar Kinematika</span>
          <HandwritingRadarChart data={radarData} />
        </div>
        <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-literasi)' }}>Tren Mood</span>
            <select value={historyRange} onChange={e => setHistoryRange(parseInt(e.target.value))}
              className="text-xs px-2 py-1 rounded-lg border outline-none bg-white"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <option value={7}>7 hari</option>
              <option value={30}>30 hari</option>
              <option value={90}>90 hari</option>
            </select>
          </div>
          <MoodTrendChart data={moodTrend} />
        </div>
      </div>

      {/* Insight detail */}
      {analysisResult && (
        <div className="p-5 rounded-2xl border mb-6" style={{ borderColor: 'var(--color-pilar-literasi)', backgroundColor: 'var(--color-pilar-literasi-soft)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-pilar-literasi)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-literasi)' }}>Detail Insight</span>
            </div>
            <button onClick={() => speak(analysisResult.handwriting_insights + '. ' + analysisResult.recommendations)}
              className="cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {analysisResult.ocr_text && (
              <div className="p-3 bg-white rounded-xl border text-sm italic" style={{ borderColor: 'var(--color-border)' }}>
                "{analysisResult.ocr_text}"
              </div>
            )}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{analysisResult.handwriting_insights}</p>
            {analysisResult.mood_stress_correlation && (
              <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>{analysisResult.mood_stress_correlation}</p>
            )}
            <div className="p-3 bg-white rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-[10px] font-semibold uppercase block mb-1" style={{ color: 'var(--color-pilar-literasi)' }}>💡 Rekomendasi</span>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{analysisResult.recommendations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" style={{ color: 'var(--color-pilar-bantuan)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-bantuan)' }}>Timeline</span>
        </div>

        {loadingTimeline && (
          <div className="text-center py-8">
            <div className="w-4 h-4 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-pilar-bantuan)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loadingTimeline && timeline.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-sm">Belum ada data. Mulai tulis jurnal di menu Stres.</p>
          </div>
        )}

        {timeline.length > 0 && (
          <div className="space-y-3">
            {timeline.slice(0, 20).map((entry, i) => {
              const stress = stressLevel(entry.stress_score)
              const isMood = entry.type === 'mood'
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isMood ? 'var(--color-pilar-stres)' : stress.color }} />
                    {i < timeline.length - 1 && <div className="w-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                        {new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {isMood ? '😊 Mood' : '📝 Jurnal'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {entry.sentiment_label}
                        {entry.note && ` — ${entry.note}`}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {entry.mood_score != null && <span>Mood: {entry.mood_score}</span>}
                      {entry.stress_score != null && <span>Stres: {entry.stress_score}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
