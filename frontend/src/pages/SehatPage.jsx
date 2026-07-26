import React, { useState, useEffect } from 'react'
import { Sun, Moon, Timer, Flame } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function SehatPage() {
  const [sleepHours, setSleepHours] = useState(7)
  const [exerciseStatus, setExerciseStatus] = useState('no')
  const [proofPhoto, setProofPhoto] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [streak, setStreak] = useState(0)
  const [streakLogs, setStreakLogs] = useState([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHabits()
    loadStreak()
  }, [])

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session ? { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' } : {}
  }

  const loadHabits = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('http://localhost:8000/api/habits', { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.habits) {
          setSleepHours(data.habits.sleep_hours || 7)
          setExerciseStatus(data.habits.exercise_status || 'no')
        }
      }
    } catch {}
    setLoading(false)
  }

  const loadStreak = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('http://localhost:8000/api/habits/streak', { headers })
      if (res.ok) {
        const data = await res.json()
        setStreak(data.streak || 0)
        setStreakLogs(data.logs || [])
      }
    } catch {}
  }

  const handleSave = async () => {
    setSaved(true)
    try {
      const headers = await getAuthHeaders()
      const body = new URLSearchParams()
      body.append('sleep_hours', sleepHours.toString())
      body.append('exercise_status', exerciseStatus)

      await fetch('http://localhost:8000/api/habits', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      loadStreak()
    } catch {}
    setTimeout(() => setSaved(false), 2000)
  }

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-pilar-sehat)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
          <Sun className="w-5 h-5" style={{ color: 'var(--color-pilar-sehat)' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Kebiasaan Sehat</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
        </div>
      </div>

      {/* Sleep */}
      <div className="p-6 rounded-2xl border mb-4" style={{ borderColor: 'var(--color-pilar-sehat)', backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5" style={{ color: 'var(--color-pilar-sehat)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Tidur Semalam</span>
        </div>
        <div className="flex items-center gap-4">
          <input type="range" min="0" max="12" step="0.5" value={sleepHours}
            onChange={e => setSleepHours(parseFloat(e.target.value))}
            className="flex-1 accent-[var(--color-pilar-sehat)]" />
          <span className="text-lg font-semibold min-w-[60px] text-right" style={{ color: 'var(--color-pilar-sehat)' }}>
            {sleepHours}j
          </span>
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>0 jam</span>
          <span>6 jam</span>
          <span>12 jam</span>
        </div>
      </div>

      {/* Exercise */}
      <div className="p-6 rounded-2xl border mb-4" style={{ borderColor: 'var(--color-pilar-sehat)', backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5" style={{ color: 'var(--color-pilar-sehat)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Olahraga Hari Ini</span>
        </div>
        <select value={exerciseStatus} onChange={e => setExerciseStatus(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-white"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
          <option value="no">Tidak</option>
          <option value="yes">Ya (minimal 15 menit)</option>
          <option value="skipped">Tidak hari ini (tapi besok)</option>
        </select>

        {exerciseStatus === 'yes' && (
          <div className="mt-3 animate-fadeIn">
            <span className="text-xs block mb-2" style={{ color: 'var(--color-text-muted)' }}>Upload bukti olahraga (foto selfie / screenshot Strava):</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer bg-white hover:bg-[var(--color-surface)]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                📸 Pilih Foto
                <input type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setProofPhoto(f); setProofPreview(URL.createObjectURL(f)) } }} />
              </label>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer bg-white hover:bg-[var(--color-surface)]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                🤳 Buka Kamera
                <input type="file" accept="image/*" capture="user" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setProofPhoto(f); setProofPreview(URL.createObjectURL(f)) } }} />
              </label>
            </div>
            {proofPreview && (
              <div className="mt-2">
                <img src={proofPreview} alt="proof" className="h-24 rounded-xl border" style={{ borderColor: 'var(--color-border)' }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save + Streak */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleSave}
          className="flex-1 py-3 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--color-pilar-sehat)' }}>
          {saved ? '✓ Tersimpan' : 'Simpan'}
        </button>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <Flame className="w-5 h-5" style={{ color: 'var(--color-pilar-sehat)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-pilar-sehat)' }}>{streak}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>hari</span>
        </div>
      </div>

      {/* Streak Visual */}
      <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: 'var(--color-pilar-sehat)' }}>
          🔥 Streak Minggu Ini
        </span>
        <div className="flex gap-2">
          {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => {
            const isActive = i < streak
            return (
              <div key={i} className="flex-1 text-center">
                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                  isActive ? 'text-white' : ''
                }`} style={{
                  backgroundColor: isActive ? 'var(--color-pilar-sehat)' : 'var(--color-surface)',
                  color: isActive ? 'white' : 'var(--color-text-muted)',
                }}>
                  ✓
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{day}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
