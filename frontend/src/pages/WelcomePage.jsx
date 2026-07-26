import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, PenLine, Heart, MapPin, UserPlus, BarChart3, Flame } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  const [greeting, setGreeting] = useState('')
  const [todaySummary, setTodaySummary] = useState(null)

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 10) setGreeting('Selamat pagi')
    else if (h < 15) setGreeting('Selamat siang')
    else if (h < 18) setGreeting('Selamat sore')
    else setGreeting('Selamat malam')
    if (localStorage.getItem('inktrace_onboarding') === 'done') setShowOnboarding(false)
  }, [])

  useEffect(() => { if (!gpsPermissionAsked) setShowGpsPrompt(true) }, [])

  useEffect(() => { if (saved && !localStorage.getItem('inktrace_onboarding')) checkTrustedCircles() }, [saved])

  useEffect(() => { fetchTodaySummary() }, [])

  const fetchTodaySummary = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const [habRes, histRes] = await Promise.all([
        fetch(API_BASE + '/api/habits', { headers: { Authorization: `Bearer ${session.access_token}` } }).then(r => r.ok ? r.json() : null),
        fetch(API_BASE + '/api/history?range=1', { headers: { Authorization: `Bearer ${session.access_token}` } }).then(r => r.ok ? r.json() : null),
      ])
      setTodaySummary({ habits: habRes?.habits, todayEntries: histRes?.entries || [] })
    } catch {}
  }

  const checkTrustedCircles = async () => {
    setLoadingContacts(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch(API_BASE + '/api/trusted-circles', { headers: { Authorization: `Bearer ${session.access_token}` } })
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts || [])
        if (!data.contacts || data.contacts.length === 0) setShowOnboarding(true)
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

  const handleGpsLater = () => { setShowGpsPrompt(false); setGpsPermissionAsked(true) }

  const handleMoodSelect = async (score) => {
    setMoodScore(score)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(API_BASE + '/api/mood-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
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
      const res = await fetch(API_BASE + '/api/trusted-circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ contact_name: newName, contact_type: newType, contact_value: newValue }),
      })
      if (res.ok) { const d = await res.json(); setContacts(p => [...p, d.data]) }
    } catch {}
    setNewName(''); setNewValue(''); setSavingContact(false)
  }

  const handleFinishOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem('inktrace_onboarding', 'done')
  }

  const handleSkipOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem('inktrace_onboarding', 'done')
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
      {showGpsPrompt && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-slideUp">
            <MapPin className="w-8 h-8 mx-auto" style={{ color: 'var(--color-pilar-bantuan)' }} />
            <h3 className="text-lg font-semibold text-center" style={{ color: 'var(--color-text)' }}>Izinkan akses lokasi?</h3>
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>Kami butuh lokasi untuk mencari klinik & psikolog terdekat.</p>
            <div className="flex gap-3">
              <button onClick={handleGpsLater} className="flex-1 py-2.5 rounded-xl text-sm font-medium border cursor-pointer" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>Nanti</button>
              <button onClick={handleGpsAllow} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: 'var(--color-pilar-bantuan)' }}>Izinkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-stres-soft)' }}>
          <Sun className="w-5 h-5" style={{ color: 'var(--color-pilar-stres)' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Hai, {greeting}!</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-xl border bg-white text-center" style={{ borderColor: 'var(--color-border)' }}>
          <Heart className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-pilar-stres)' }} />
          <div className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{moodScore || '-'}</div>
          <div className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Mood Hari Ini</div>
        </div>
        <div className="p-3 rounded-xl border bg-white text-center" style={{ borderColor: 'var(--color-border)' }}>
          <Moon className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-pilar-sehat)' }} />
          <div className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{todaySummary?.habits?.sleep_hours ?? '-'}</div>
          <div className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Tidur</div>
        </div>
        <div className="p-3 rounded-xl border bg-white text-center" style={{ borderColor: 'var(--color-border)' }}>
          <BarChart3 className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-pilar-literasi)' }} />
          <div className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{todaySummary?.todayEntries?.length || 0}</div>
          <div className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Jurnal</div>
        </div>
      </div>

      {/* Mood Log */}
      {!showOnboarding && (
        <div className="p-5 rounded-2xl border mb-4" style={{ borderColor: 'var(--color-pilar-stres)', backgroundColor: 'var(--color-pilar-stres-soft)' }}>
          <h2 className="text-base font-medium mb-1" style={{ color: 'var(--color-text)' }}>Bagaimana perasaanmu pagi ini?</h2>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Pilih yang paling mendekati</p>

          {!saved ? (
            <div className="space-y-3">
              <div className="flex gap-2 justify-center">
                {moodEmojis.map((m) => (
                  <button key={m.score} onClick={() => handleMoodSelect(m.score)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer min-w-[52px] ${moodScore === m.score ? 'border-[var(--color-pilar-stres)] bg-white scale-105' : 'border-transparent bg-white/60 hover:bg-white'}`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[8px] font-medium" style={{ color: moodScore === m.score ? 'var(--color-pilar-stres)' : 'var(--color-text-muted)' }}>{m.label}</span>
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Ada yang mau diceritakan? (opsional)" value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
            </div>
          ) : (
            <div className="text-center py-3 animate-fadeIn">
              <p className="text-base mb-1">Terima kasih! 🌟</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{note ? `"${note}"` : 'Moodmu sudah dicatat.'}</p>
            </div>
          )}
        </div>
      )}

      {/* Onboarding */}
      {showOnboarding && (
        <div className="p-5 rounded-2xl border mb-4 animate-slideUp" style={{ borderColor: 'var(--color-pilar-sosial)', backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
          <div className="text-center mb-3">
            <Heart className="w-7 h-7 mx-auto mb-2 text-white p-1.5 rounded-full" style={{ backgroundColor: 'var(--color-pilar-sosial)' }} />
            <h2 className="text-base font-medium mb-1" style={{ color: 'var(--color-text)' }}>Siapa yang bisa dihubungi?</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Kami akan kirim notifikasi ke kontak ini saat diperlukan.</p>
          </div>
          {contacts.length > 0 && (
            <div className="space-y-2 mb-3">
              {contacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl text-xs border" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>{c.contact_name.charAt(0)}</div>
                    <div><div className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{c.contact_name}</div><div className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{c.contact_value}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAddContact} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Nama" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }} required />
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}><option value="email">Email</option><option value="whatsapp">WA</option></select>
            </div>
            <input type="text" placeholder="Email atau nomor WA" value={newValue} onChange={e => setNewValue(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }} required />
            <button type="submit" disabled={savingContact} className="w-full py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>Tambah Kontak</button>
          </form>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSkipOnboarding} className="flex-1 py-2 rounded-xl text-xs border cursor-pointer" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>Lewati</button>
            <button onClick={handleFinishOnboarding} className="flex-1 py-2 rounded-xl text-xs font-medium text-white cursor-pointer" style={{ backgroundColor: 'var(--color-text)' }}>Selesai</button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <button onClick={() => navigate('/stres')} className="w-full flex items-center gap-3 p-3.5 rounded-xl border bg-white hover:bg-[var(--color-surface)] transition-all cursor-pointer text-left" style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-stres-soft)' }}><PenLine className="w-5 h-5" style={{ color: 'var(--color-pilar-stres)' }} /></div>
          <div className="flex-1"><div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Ceritakan Harimu</div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tulis jurnal + analisis AI</div></div>
          <span className="text-lg" style={{ color: 'var(--color-text-muted)' }}>→</span>
        </button>
        <button onClick={() => navigate('/literasi')} className="w-full flex items-center gap-3 p-3.5 rounded-xl border bg-white hover:bg-[var(--color-surface)] transition-all cursor-pointer text-left" style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-literasi-soft)' }}><BarChart3 className="w-5 h-5" style={{ color: 'var(--color-pilar-literasi)' }} /></div>
          <div className="flex-1"><div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Lihat Wawasan</div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Grafik mood & insight AI</div></div>
          <span className="text-lg" style={{ color: 'var(--color-text-muted)' }}>→</span>
        </button>
        <button onClick={() => navigate('/sehat')} className="w-full flex items-center gap-3 p-3.5 rounded-xl border bg-white hover:bg-[var(--color-surface)] transition-all cursor-pointer text-left" style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-sehat-soft)' }}><Moon className="w-5 h-5" style={{ color: 'var(--color-pilar-sehat)' }} /></div>
          <div className="flex-1"><div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Log Kebiasaan</div><div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tidur & olahraga harian</div></div>
          <span className="text-lg" style={{ color: 'var(--color-text-muted)' }}>→</span>
        </button>
      </div>
    </div>
  )
}

function Moon(props) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> }
