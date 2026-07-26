import React, { useEffect, useState, useRef } from 'react'
import { BarChart3, Heart, Sparkles, Brain, Volume2, Clock, MessageCircle, Send, Bot, User } from 'lucide-react'
import { HandwritingRadarChart } from '../components/HandwritingRadarChart'
import { MoodTrendChart } from '../components/MoodTrendChart'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Chatbot inline ──────────────────────────────────────────────
const INIT_MSG = { role: 'assistant', content: 'Halo! Ada yang ingin kamu ceritakan atau tanyakan soal wawasan emosi kamu? Aku siap dengerin. 😊' }

function InlineChat({ stressScore }) {
  const [messages, setMessages] = useState([INIT_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isStable, setIsStable] = useState(false)
  const [showDraft, setShowDraft] = useState(false)
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMsg = async () => {
    if (!input.trim() || loading || messages.length >= 12) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_BASE}/api/ai-companion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ messages: newMsgs.slice(-6), stress_score: stressScore }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        if (data.is_crisis) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '🚨 Jika kamu dalam kondisi krisis, segera hubungi:\n• Hotline Kemenkes: 119 ext. 8\n• Into The Light: intothelightid.org\n• LISA: +62 811 3855 472',
          }])
        }
        if (data.is_stable) {
          setIsStable(true)
          setTimeout(() => setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Kamu terdengar lebih tenang sekarang 🌿 Mau aku bantu buat draft pesan buat teman atau keluargamu?',
          }]), 1000)
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, ada gangguan. Coba lagi ya.' }])
    }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border flex flex-col" style={{ borderColor: 'var(--color-pilar-stres)', backgroundColor: 'var(--color-bg)', minHeight: 380, maxHeight: 500 }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b rounded-t-2xl" style={{ borderColor: 'var(--color-pilar-stres)', backgroundColor: 'var(--color-pilar-stres-soft)' }}>
        <MessageCircle className="w-4 h-4" style={{ color: 'var(--color-pilar-stres)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--color-pilar-stres)' }}>Ngobrol Yuk</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-pilar-stres)', color: 'white' }}>AI Companion</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 320 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--color-pilar-stres-soft)' }}>
                <Bot className="w-3.5 h-3.5" style={{ color: 'var(--color-pilar-stres)' }} />
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-br-md text-white' : 'rounded-bl-md'}`}
              style={{ backgroundColor: msg.role === 'user' ? 'var(--color-pilar-stres)' : 'var(--color-surface)', color: msg.role === 'user' ? 'white' : 'var(--color-text)' }}>
              {msg.content.split('\n').map((l, j) => <p key={j}>{l}</p>)}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--color-text)' }}>
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex gap-1">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-pilar-stres)', animationDelay: `${i*0.15}s` }} />)}
            </div>
            Mengetik...
          </div>
        )}
        {isStable && !showDraft && (
          <button onClick={() => { setDraft('Hai, akhir-akhir ini aku lagi agak berat. Bisa luangin waktu buat ngobrol?'); setShowDraft(true) }}
            className="w-full py-2 rounded-xl text-xs font-medium border cursor-pointer"
            style={{ borderColor: 'var(--color-pilar-sosial)', color: 'var(--color-pilar-sosial)' }}>
            ✨ Bantu buat draft pesan ke teman
          </button>
        )}
        {showDraft && (
          <div className="p-3 rounded-xl border text-xs" style={{ borderColor: 'var(--color-pilar-sosial)', backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
            <p className="font-medium mb-1" style={{ color: 'var(--color-pilar-sosial)' }}>📝 Draft pesan:</p>
            <p className="italic p-2 bg-white rounded-lg" style={{ color: 'var(--color-text)' }}>"{draft}"</p>
            <button onClick={() => navigator.clipboard?.writeText(draft)}
              className="mt-2 text-xs font-medium px-3 py-1 rounded-lg text-white cursor-pointer"
              style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>📋 Salin</button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {messages.length >= 12 ? (
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>Sudah cukup untuk sekarang. Jaga dirimu ya 🫶</p>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Ceritakan sesuatu..."
              className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
              disabled={loading}
            />
            <button onClick={sendMsg} disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────
export default function LiterasiPage() {
  const { analysisResult, radarData, moodTrend, setMoodTrend } = useApp()
  const [historyRange, setHistoryRange] = useState(7)
  const [timeline, setTimeline] = useState([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [timelineError, setTimelineError] = useState(null)

  useEffect(() => { fetchHistory() }, [historyRange])
  useEffect(() => { fetchTimeline() }, [])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session ? { Authorization: `Bearer ${session.access_token}` } : {}
  }

  const fetchHistory = async () => {
    try {
      const headers = await getHeaders()
      if (!headers.Authorization) return
      const res = await fetch(`${API_BASE}/api/history?range=${historyRange}`, { headers })
      if (!res.ok) return
      const data = await res.json()
      if (data.entries?.length > 0) {
        const trends = data.entries
          .filter(e => e.type === 'journal')
          .map(e => ({
            date: new Date(e.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
            mood: e.mood_score,
          }))
        if (analysisResult?.future_mood_prediction) {
          const p = analysisResult.future_mood_prediction
          trends.push(
            { date: 'H+1', mood: p[0] }, { date: 'H+2', mood: p[1] },
            { date: 'H+3', mood: p[2] }, { date: 'H+4', mood: p[3] }
          )
        }
        if (trends.length > 0) setMoodTrend(trends)
      }
    } catch {}
  }

  const fetchTimeline = async () => {
    setLoadingTimeline(true)
    setTimelineError(null)
    try {
      const headers = await getHeaders()
      if (!headers.Authorization) {
        setTimelineError('Belum login')
        setLoadingTimeline(false)
        return
      }
      const res = await fetch(`${API_BASE}/api/history?range=30`, { headers })
      if (!res.ok) {
        setTimelineError(`Gagal memuat (${res.status}). Pastikan backend berjalan.`)
        setLoadingTimeline(false)
        return
      }
      const data = await res.json()
      if (data.entries) {
        setTimeline(data.entries.sort((a, b) => new Date(b.date) - new Date(a.date)))
      }
    } catch (e) {
      setTimelineError('Tidak bisa terhubung ke backend. Cek apakah backend sudah berjalan di port 8000.')
    }
    setLoadingTimeline(false)
  }

  const stressLevel = (score) => {
    if (score == null) return { label: '-', color: 'var(--color-text-muted)' }
    if (score >= 70) return { label: 'Tinggi', color: 'var(--color-pilar-darurat)' }
    if (score >= 40) return { label: 'Sedang', color: '#f59e0b' }
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

      {analysisResult && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl border text-center" style={{ borderColor: 'var(--color-pilar-literasi)', backgroundColor: 'var(--color-pilar-literasi-soft)' }}>
            <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-literasi)' }} />
            <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>Mood AI</span>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-pilar-literasi)' }}>{analysisResult.mood_score}/100</div>
            <div className="w-full rounded-full h-1.5 mt-2" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="h-full rounded-full" style={{ width: `${analysisResult.mood_score || 0}%`, backgroundColor: 'var(--color-pilar-literasi)' }} />
            </div>
            <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-muted)' }}>{analysisResult.sentiment_label}</span>
          </div>
          <div className="p-4 rounded-2xl border text-center" style={{ borderColor: 'var(--color-pilar-sehat)', backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
            <Brain className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-sehat)' }} />
            <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: 'var(--color-text-muted)' }}>Stres AI</span>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-pilar-sehat)' }}>{analysisResult.stress_score}/100</div>
            <div className="w-full rounded-full h-1.5 mt-2" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="h-full rounded-full" style={{ width: `${analysisResult.stress_score || 0}%`, backgroundColor: 'var(--color-pilar-sehat)' }} />
            </div>
            <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-muted)' }}>
              {analysisResult.stress_score >= 70 ? 'Perlu perhatian' : analysisResult.stress_score >= 40 ? 'Sedang' : 'Stabil'}
            </span>
          </div>
        </div>
      )}

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

      {/* AI Chatbot + Timeline grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <InlineChat stressScore={analysisResult?.stress_score} />
        </div>

        <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--color-pilar-bantuan)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-bantuan)' }}>Timeline 30 Hari</span>
            </div>
            <button onClick={fetchTimeline}
              className="text-xs px-2 py-1 rounded-lg cursor-pointer"
              style={{ color: 'var(--color-pilar-bantuan)', backgroundColor: 'var(--color-surface)' }}>
              ↺ Refresh
            </button>
          </div>

          {loadingTimeline && (
            <div className="text-center py-8">
              <div className="w-4 h-4 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-pilar-bantuan)', borderTopColor: 'transparent' }} />
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>Memuat timeline...</p>
            </div>
          )}

          {!loadingTimeline && timelineError && (
            <div className="text-center py-6 px-3">
              <p className="text-sm" style={{ color: '#ef4444' }}>⚠️ {timelineError}</p>
              <button onClick={fetchTimeline}
                className="mt-3 text-xs px-4 py-2 rounded-xl cursor-pointer text-white"
                style={{ backgroundColor: 'var(--color-pilar-bantuan)' }}>
                Coba Lagi
              </button>
            </div>
          )}

          {!loadingTimeline && !timelineError && timeline.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada data.</p>
              <p className="text-xs mt-1">Mulai tulis jurnal di menu Stres.</p>
            </div>
          )}

          {!loadingTimeline && timeline.length > 0 && (
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 340 }}>
              {timeline.slice(0, 20).map((entry, i) => {
                const stress = stressLevel(entry.stress_score)
                const isMood = entry.type === 'mood'
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: isMood ? 'var(--color-pilar-stres)' : stress.color }} />
                      {i < timeline.length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: 'var(--color-border)' }} />}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                          {new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                          {isMood ? '😊 Mood' : '📝 Jurnal'}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {entry.sentiment_label}{entry.note ? ` — ${entry.note}` : ''}
                      </p>
                      <div className="flex gap-3 mt-0.5 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {entry.mood_score != null && <span>Mood: {entry.mood_score}</span>}
                        {entry.stress_score != null && <span style={{ color: stress.color }}>Stres: {entry.stress_score} ({stress.label})</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
