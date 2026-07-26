import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, PenLine, Heart, MapPin, UserPlus, Check, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { userLocation, setUserLocation, gpsPermissionAsked, setGpsPermissionAsked } = useApp()
  const [moodScore, setMoodScore] = useState(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [showGpsPrompt, setShowGpsPrompt] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('email')
  const [newValue, setNewValue] = useState('')
  const [savingContact, setSavingContact] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 10) setGreeting('Selamat pagi')
    else if (h < 15) setGreeting('Selamat siang')
    else if (h < 18) setGreeting('Selamat sore')
    else setGreeting('Selamat malam')
  }, [])

  useEffect(() => {
    if (!gpsPermissionAsked) setShowGpsPrompt(true)
  }, [])

  useEffect(() => {
    if (saved) {
      checkTrustedCircles()
    }
  }, [saved])

  const checkTrustedCircles = async () => {
    setLoadingContacts(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('http://localhost:8000/api/trusted-circles', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts || [])
        if (!data.contacts || data.contacts.length === 0) {
          setShowOnboarding(true)
        }
      }
    } catch {}
    setLoadingContacts(false)
  }

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
    setSaved(true)
  }

  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!newName || !newValue) return
    setSavingContact(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('http://localhost:8000/api/trusted-circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ contact_name: newName, contact_type: newType, contact_value: newValue }),
      })
      if (res.ok) {
        const data = await res.json()
        setContacts(prev => [...prev, data.data])
      }
    } catch {}
    setNewName('')
    setNewValue('')
    setSavingContact(false)
  }

  const handleFinishOnboarding = () => {
    setShowOnboarding(false)
    setOnboardingDone(true)
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
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Hai, {greeting}!</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
        </div>
      </div>

      {/* Mood Log */}
      {!showOnboarding && (
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
      )}

      {/* Onboarding Trusted Circle */}
      {showOnboarding && (
        <div className="p-6 rounded-2xl border mb-6 animate-slideUp" style={{ borderColor: 'var(--color-pilar-sosial)', backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-base font-medium mb-1" style={{ color: 'var(--color-text)' }}>Siapa yang bisa dihubungi?</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Kalau kamu butuh bantuan, siapa yang ingin kamu hubungi? Kami akan kirim notifikasi ke kontak ini saat diperlukan.
            </p>
          </div>

          {/* Contact list */}
          {contacts.length > 0 && (
            <div className="space-y-2 mb-4">
              {contacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl text-sm border"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                      style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
                      {c.contact_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{c.contact_name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{c.contact_value}</div>
                    </div>
                  </div>
                  <Check className="w-4 h-4" style={{ color: 'var(--color-pilar-sosial)' }} />
                </div>
              ))}
            </div>
          )}

          {/* Add contact form */}
          <form onSubmit={handleAddContact} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Nama kontak" value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                required />
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder={newType === 'email' ? 'Email kontak' : 'Nomor WhatsApp'} value={newValue} onChange={e => setNewValue(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                required />
              <button type="submit" disabled={savingContact}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
                {savingContact ? <Loader className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Tambah
              </button>
            </div>
          </form>

          <button onClick={handleFinishOnboarding}
            className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--color-text)' }}>
            {contacts.length > 0 ? 'Selesai — Mulai' : 'Lewati dulu'}
          </button>
        </div>
      )}

      {/* Quick Actions (after onboarding) */}
      {!showOnboarding && saved && (
        <div className="space-y-3 animate-fadeIn">
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
      )}
    </div>
  )
}
