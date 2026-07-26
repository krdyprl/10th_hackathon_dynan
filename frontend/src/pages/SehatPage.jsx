import React, { useState, useEffect } from 'react'
import { Sun, Moon, Timer, Flame, TrendingUp, Droplets, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Konstanta ──────────────────────────────────────────────────
const EXERCISE_OPTIONS = [
  { value: 'no', label: '❌ Tidak' },
  { value: 'lari', label: '🏃 Lari' },
  { value: 'jalan', label: '🚶 Jalan' },
  { value: 'berenang', label: '🏊 Berenang' },
  { value: 'custom', label: '💪 Custom' },
  { value: 'skipped', label: '🔜 Besok deh' },
]

const WATER_TARGET = 8  // gelas per hari
const HARI_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const sleepBarColor = (val) => {
  if (val == null) return '#e5e7eb'
  if (val >= 7) return '#22c55e'
  if (val >= 5) return '#f59e0b'
  return '#ef4444'
}

// ── Tooltip kustom ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl text-xs shadow-lg bg-white border" style={{ borderColor: '#e5e7eb' }}>
      <p className="font-semibold mb-1" style={{ color: '#374151' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value != null ? p.value : '—'}{p.name === 'Tidur' ? 'j' : p.name === 'Air' ? ' gelas' : ''}
        </p>
      ))}
    </div>
  )
}

// ── Komponen Water Tracker ────────────────────────────────────
function WaterTracker({ glasses, onChange }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ borderColor: 'var(--color-pilar-sehat)', backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5" style={{ color: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Minum Air</span>
        </div>
        <span className="text-sm font-bold" style={{ color: glasses >= WATER_TARGET ? '#22c55e' : '#3b82f6' }}>
          {glasses}/{WATER_TARGET} gelas
        </span>
      </div>
      {/* Gelas visual */}
      <div className="flex gap-2 flex-wrap mb-3">
        {Array.from({ length: WATER_TARGET }).map((_, i) => (
          <button key={i} onClick={() => onChange(i < glasses ? i : i + 1)}
            className="w-9 h-9 rounded-xl border-2 flex items-center justify-center text-lg cursor-pointer transition-all"
            style={{
              borderColor: i < glasses ? '#3b82f6' : 'var(--color-border)',
              backgroundColor: i < glasses ? '#dbeafe' : 'white',
            }}>
            {i < glasses ? '💧' : '○'}
          </button>
        ))}
      </div>
      {/* Tambah/kurang */}
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, glasses - 1))}
          className="flex-1 py-2 rounded-xl border text-sm font-medium cursor-pointer"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>− Kurang</button>
        <button onClick={() => onChange(Math.min(16, glasses + 1))}
          className="flex-1 py-2 rounded-xl text-sm font-medium text-white cursor-pointer"
          style={{ backgroundColor: '#3b82f6' }}>+ Tambah</button>
      </div>
      {glasses >= WATER_TARGET && (
        <p className="text-xs text-center mt-2" style={{ color: '#22c55e' }}>🎉 Target hidrasi hari ini tercapai!</p>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function SehatPage() {
  const [sleepHours, setSleepHours] = useState(7)
  const [sleepNote, setSleepNote] = useState('')
  const [exerciseStatus, setExerciseStatus] = useState('no')
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [proofPreview, setProofPreview] = useState(null)
  const [streak, setStreak] = useState(0)
  const [sleepHistory, setSleepHistory] = useState([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState(null)
  const [loadingAi, setLoadingAi] = useState(false)
  const [showAdvice, setShowAdvice] = useState(false)

  useEffect(() => {
    // Tunggu session Supabase siap sebelum fetch, hindari race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadHabits()
        loadStreak()
      }
    })
    // Coba langsung juga untuk kasus session sudah ada
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadHabits()
        loadStreak()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session ? { Authorization: `Bearer ${session.access_token}` } : {}
  }

  const loadHabits = async () => {
    try {
      const headers = await getAuthHeaders()
      if (!headers.Authorization) { setLoading(false); return }
      const res = await fetch(API_BASE + '/api/habits', { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.habits) {
          setSleepHours(data.habits.sleep_hours ?? 7)
          setExerciseStatus(data.habits.exercise_status || 'no')
          setWaterGlasses(data.habits.water_glasses ?? 0)
          setSleepNote(data.habits.sleep_note || '')
        }
      }
    } catch {}
    setLoading(false)
  }

  const loadStreak = async () => {
    try {
      const headers = await getAuthHeaders()
      if (!headers.Authorization) return
      const res = await fetch(API_BASE + '/api/habits/streak', { headers })
      if (res.ok) {
        const data = await res.json()
        setStreak(data.streak || 0)
        setSleepHistory((data.sleep_history || []).map(d => ({
          day: HARI_NAMES[new Date(d.date + 'T00:00:00').getDay()],
          Tidur: d.sleep_hours != null ? parseFloat(d.sleep_hours) : null,
          Air: d.water_glasses ?? null,
          exercise: d.exercise_status,
          date: d.date,
        })))
      }
    } catch {}
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    setSaveError(null)
    try {
      const headers = await getAuthHeaders()
      if (!headers.Authorization) { setSaveError('Belum login'); setSaving(false); return }
      const body = new URLSearchParams()
      body.append('sleep_hours', sleepHours.toString())
      body.append('exercise_status', exerciseStatus)
      body.append('water_glasses', waterGlasses.toString())
      body.append('sleep_note', sleepNote)

      const res = await fetch(API_BASE + '/api/habits', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setSaveError(err.detail || `Error ${res.status}`)
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      loadStreak()
    } catch { setSaveError('Gagal menyimpan. Cek koneksi backend.') }
    finally { setSaving(false) }
  }

  const fetchAiSummary = async () => {
    setLoadingAi(true)
    try {
      const headers = await getAuthHeaders()
      if (!headers.Authorization) { setLoadingAi(false); return }
      const res = await fetch(API_BASE + '/api/habits/ai-summary', { method: 'POST', headers })
      if (res.ok) {
        const data = await res.json()
        setAiSummary(data)
        setShowAdvice(true)
      }
    } catch {}
    setLoadingAi(false)
  }

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-pilar-sehat)', borderTopColor: 'transparent' }} />
    </div>
  )

  const hasChartData = sleepHistory.some(d => d.Tidur != null || d.Air != null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
          <Sun className="w-5 h-5" style={{ color: 'var(--color-pilar-sehat)' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Kebiasaan Sehat</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <Flame className="w-4 h-4" style={{ color: streak > 0 ? '#f97316' : 'var(--color-text-muted)' }} />
          <span className="text-base font-bold" style={{ color: streak > 0 ? '#f97316' : 'var(--color-text-muted)' }}>{streak}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>hari</span>
        </div>
      </div>

      {/* Tidur */}
      <div className="p-5 rounded-2xl border" style={{ borderColor: 'var(--color-pilar-sehat)', backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-5 h-5" style={{ color: 'var(--color-pilar-sehat)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Tidur Semalam</span>
          <span className="ml-auto text-2xl font-bold" style={{ color: 'var(--color-pilar-sehat)' }}>{sleepHours}j</span>
        </div>
        <input type="range" min="0" max="12" step="0.5" value={sleepHours}
          onChange={e => setSleepHours(parseFloat(e.target.value))}
          className="w-full mb-2 accent-[var(--color-pilar-sehat)]" />
        <div className="flex justify-between text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          <span>0j</span>
          <span className={sleepHours < 7 ? 'font-medium' : ''} style={{ color: sleepHours < 5 ? '#ef4444' : sleepHours < 7 ? '#f59e0b' : '#22c55e' }}>
            {sleepHours < 5 ? '😴 Kurang banget' : sleepHours < 7 ? '😐 Kurang ideal' : '✅ Cukup'}
          </span>
          <span>12j</span>
        </div>
        <textarea
          value={sleepNote}
          onChange={e => setSleepNote(e.target.value)}
          placeholder="Catatan tidur... (opsional)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'white' }}
        />
      </div>

      {/* Air Minum */}
      <WaterTracker glasses={waterGlasses} onChange={setWaterGlasses} />

      {/* Olahraga */}
      <div className="p-5 rounded-2xl border" style={{ borderColor: 'var(--color-pilar-sehat)', backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Timer className="w-5 h-5" style={{ color: 'var(--color-pilar-sehat)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Olahraga Hari Ini</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {EXERCISE_OPTIONS.map(({ value, label }) => (
            <button key={value} onClick={() => setExerciseStatus(value)}
              className="py-2.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer"
              style={{
                borderColor: exerciseStatus === value ? 'var(--color-pilar-sehat)' : 'var(--color-border)',
                backgroundColor: exerciseStatus === value ? 'var(--color-pilar-sehat)' : 'white',
                color: exerciseStatus === value ? 'white' : 'var(--color-text)',
              }}>
              {label}
            </button>
          ))}
        </div>
        {exerciseStatus !== 'no' && exerciseStatus !== 'skipped' && (
          <div className="mt-3 animate-fadeIn">
            <span className="text-xs block mb-2" style={{ color: 'var(--color-text-muted)' }}>Upload bukti (opsional):</span>
            <div className="flex gap-2">
              <label className="flex-1 text-center py-2 rounded-xl border text-xs cursor-pointer bg-white">
                📸 Pilih Foto
                <input type="file" accept="image/*" className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setProofPreview(URL.createObjectURL(f)) }} />
              </label>
              <label className="flex-1 text-center py-2 rounded-xl border text-xs cursor-pointer bg-white">
                🤳 Kamera
                <input type="file" accept="image/*" capture="user" className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setProofPreview(URL.createObjectURL(f)) }} />
              </label>
            </div>
            {proofPreview && <img src={proofPreview} alt="proof" className="mt-2 h-20 rounded-xl border" style={{ borderColor: 'var(--color-border)' }} />}
          </div>
        )}
      </div>

      {/* Simpan */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: saved ? '#22c55e' : 'var(--color-pilar-sehat)' }}>
        {saving ? '⏳ Menyimpan...' : saved ? '✓ Tersimpan!' : '💾 Simpan Hari Ini'}
      </button>

      {saveError && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
          ⚠️ {saveError}
        </div>
      )}

      {/* Diagram Gabungan */}
      {hasChartData && (
        <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-pilar-sehat)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Tren 7 Hari</span>
          </div>

          <p className="text-xs mb-2 mt-3" style={{ color: 'var(--color-text-muted)' }}>🌙 Jam Tidur</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={sleepHistory} barSize={24} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} ticks={[0, 4, 7, 10, 12]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', radius: 8 }} />
              <ReferenceLine y={7} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1.5}
                label={{ value: '7j', position: 'right', fontSize: 9, fill: '#22c55e' }} />
              <Bar dataKey="Tidur" radius={[5, 5, 0, 0]}>
                {sleepHistory.map((entry, i) => (
                  <Cell key={i} fill={sleepBarColor(entry.Tidur)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1 text-[10px]" style={{ color: '#9ca3af' }}>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded inline-block bg-green-400" /> ≥7j</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded inline-block bg-amber-400" /> 5-7j</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded inline-block bg-red-400" /> &lt;5j</span>
          </div>

          <p className="text-xs mb-2 mt-4" style={{ color: 'var(--color-text-muted)' }}>💧 Gelas Air Minum</p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={sleepHistory} barSize={24} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} ticks={[0, 4, 8, 12]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', radius: 8 }} />
              <ReferenceLine y={8} stroke="#3b82f6" strokeDasharray="4 2" strokeWidth={1.5}
                label={{ value: '8', position: 'right', fontSize: 9, fill: '#3b82f6' }} />
              <Bar dataKey="Air" fill="#93c5fd" radius={[5, 5, 0, 0]}>
                {sleepHistory.map((entry, i) => (
                  <Cell key={i} fill={entry.Air != null && entry.Air >= 8 ? '#3b82f6' : entry.Air != null && entry.Air >= 5 ? '#93c5fd' : '#dbeafe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Streak Harian */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-sehat)' }}>🔥 Streak Harian</span>
          {streak > 0 && <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#f97316' }}>{streak} hari beruntun!</span>}
        </div>
        <div className="flex gap-2">
          {sleepHistory.length > 0
            ? sleepHistory.map((d, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="w-full aspect-square rounded-xl flex items-center justify-center text-sm transition-all"
                    style={{
                      backgroundColor: d.Tidur != null ? 'var(--color-pilar-sehat)' : 'var(--color-surface)',
                      color: d.Tidur != null ? 'white' : 'var(--color-text-muted)',
                    }}>
                    {d.Tidur != null ? '✓' : '·'}
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{d.day}</div>
                </div>
              ))
            : ['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="w-full aspect-square rounded-xl flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>·</div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{day}</div>
                </div>
              ))
          }
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-5 rounded-2xl border" style={{ borderColor: 'var(--color-pilar-literasi)', backgroundColor: 'var(--color-pilar-literasi-soft)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-pilar-literasi)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-pilar-literasi)' }}>Ringkasan AI</span>
          </div>
          {!aiSummary ? (
            <button onClick={fetchAiSummary} disabled={loadingAi}
              className="text-xs px-3 py-1.5 rounded-xl text-white cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-pilar-literasi)' }}>
              {loadingAi ? '⏳ Memuat...' : '✨ Minta Analisis'}
            </button>
          ) : (
            <button onClick={() => setShowAdvice(v => !v)}
              className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'var(--color-pilar-literasi)' }}>
              {showAdvice ? <><ChevronUp className="w-4 h-4" /> Tutup</> : <><ChevronDown className="w-4 h-4" /> Lihat</>}
            </button>
          )}
        </div>

        {!aiSummary && !loadingAi && (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Klik "Minta Analisis" dan AI akan merangkum pola kebiasaanmu 7 hari terakhir + saran personal.
          </p>
        )}

        {loadingAi && (
          <div className="flex items-center gap-2 py-2">
            <div className="flex gap-1">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-pilar-literasi)', animationDelay: `${i*0.15}s` }} />)}
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>AI sedang menganalisis kebiasaanmu...</span>
          </div>
        )}

        {aiSummary && showAdvice && (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-3 bg-white rounded-xl border text-sm leading-relaxed" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              {aiSummary.summary}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {aiSummary.sleep_insight && (
                <div className="px-3 py-2 rounded-xl bg-white border text-xs" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="font-semibold block mb-0.5" style={{ color: 'var(--color-pilar-sehat)' }}>🌙 Tidur</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{aiSummary.sleep_insight}</span>
                </div>
              )}
              {aiSummary.exercise_insight && (
                <div className="px-3 py-2 rounded-xl bg-white border text-xs" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="font-semibold block mb-0.5" style={{ color: 'var(--color-pilar-sehat)' }}>🏃 Olahraga</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{aiSummary.exercise_insight}</span>
                </div>
              )}
              {aiSummary.water_insight && (
                <div className="px-3 py-2 rounded-xl bg-white border text-xs" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="font-semibold block mb-0.5" style={{ color: '#3b82f6' }}>💧 Hidrasi</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{aiSummary.water_insight}</span>
                </div>
              )}
            </div>

            {aiSummary.advice?.length > 0 && (
              <div className="p-3 bg-white rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--color-pilar-literasi)' }}>💡 Saran Minggu Ini</span>
                <ul className="space-y-1.5">
                  {aiSummary.advice.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--color-pilar-literasi)' }}>{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiSummary.mood_prediction && (
              <p className="text-xs italic text-center px-2" style={{ color: 'var(--color-text-muted)' }}>
                🔮 {aiSummary.mood_prediction}
              </p>
            )}

            <button onClick={() => { setAiSummary(null); fetchAiSummary() }}
              className="w-full py-2 text-xs rounded-xl border cursor-pointer"
              style={{ borderColor: 'var(--color-pilar-literasi)', color: 'var(--color-pilar-literasi)' }}>
              ↺ Refresh Analisis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
