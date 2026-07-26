import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, PenLine, Heart, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { userLocation, setUserLocation, gpsPermissionAsked, setGpsPermissionAsked } = useApp()
  const [moodScore, setMoodScore] = useState(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [showGpsPrompt, setShowGpsPrompt] = useState(false)

  useEffect(() => {
    if (!gpsPermissionAsked) {
      setShowGpsPrompt(true)
    }
  }, [])

  const handleGpsAllow = () => {
    setShowGpsPrompt(false)
    setGpsPermissionAsked(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleGpsLater = () => {
    setShowGpsPrompt(false)
    setGpsPermissionAsked(true)
  }

  const handleMoodSelect = async (score) => {
    setMoodScore(score)
    setSaved(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('http://localhost:8000/api/mood-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ mood_score: score, note }),
      })
    } catch {}
  }

  const moodEmojis = [
    { score: 1, emoji: '😭', label: 'Sangat berat' },
    { score: 2, emoji: '😔', label: 'Sedih' },
    { score: 3, emoji: '😐', label: 'Biasa' },
    { score: 4, emoji: '🙂', label: 'Baik' },
    { score: 5, emoji: '😄', label: 'Sangat baik' },
  ]

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      {/* GPS Prompt */}
      {showGpsPrompt && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-slideUp">
            <MapPin className="w-8 h-8 mx-auto" style={{ color: 'var(--color-pilar-bantuan)' }} />
            <h3 className="text-lg font-semibold text-center" style={{ color: 'var(--color-text)' }}>Izinkan akses lokasi?</h3>
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              Kami butuh lokasi untuk mencari klinik & psikolog terdekat saat kamu butuh bantuan.
            </p>
            <div className="flex gap-3">
              <button onClick={handleGpsLater}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border cursor-pointer"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                Nanti
              </button>
              <button onClick={handleGpsAllow}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
                style={{ backgroundColor: 'var(--color-pilar-bantuan)' }}>
                Izinkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-stres-soft)' }}>
          <Sun className="w-5 h-5" style={{ color: 'var(--color-pilar-stres)' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Hai, selamat pagi!</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
        </div>
      </div>

      {/* Mood Log */}
      <div className="p-6 rounded-2xl border mb-6" style={{ borderColor: 'var(--color-pilar-stres)', backgroundColor: 'var(--color-pilar-stres-soft)' }}>
        <h2 className="text-base font-medium mb-1" style={{ color: 'var(--color-text)' }}>Bagaimana perasaanmu pagi ini?</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Pilih yang paling mendekati</p>

        {!saved ? (
          <div className="flex gap-2 justify-center">
            {moodEmojis.map((m) => (
              <button key={m.score} onClick={() => handleMoodSelect(m.score)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer min-w-[56px] ${
                  moodScore === m.score ? 'border-[var(--color-pilar-stres)] bg-white scale-105' : 'border-transparent bg-white/60 hover:bg-white'
                }`}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[9px] font-medium" style={{ color: moodScore === m.score ? 'var(--color-pilar-stres)' : 'var(--color-text-muted)' }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 animate-fadeIn">
            <p className="text-lg mb-2">Terima kasih! 🌟</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Moodmu sudah dicatat.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button onClick={() => navigate('/stres')}
          className="w-full flex items-center gap-4 p-4 rounded-xl border bg-white hover:bg-[var(--color-surface)] transition-all cursor-pointer text-left"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-stres-soft)' }}>
            <PenLine className="w-5 h-5" style={{ color: 'var(--color-pilar-stres)' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Ceritakan Harimu</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tulis jurnal + analisis AI</div>
          </div>
          <span className="text-lg" style={{ color: 'var(--color-text-muted)' }}>→</span>
        </button>

        <button onClick={() => navigate('/literasi')}
          className="w-full flex items-center gap-4 p-4 rounded-xl border bg-white hover:bg-[var(--color-surface)] transition-all cursor-pointer text-left"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-literasi-soft)' }}>
            <Heart className="w-5 h-5" style={{ color: 'var(--color-pilar-literasi)' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Lihat Wawasan</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Grafik mood & insight AI</div>
          </div>
          <span className="text-lg" style={{ color: 'var(--color-text-muted)' }}>→</span>
        </button>
      </div>
    </div>
  )
}

function MapPin(props) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
}