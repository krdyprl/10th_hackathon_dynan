import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, BookOpen, Flame, Heart, Clock, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ProfilPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalJournals: 0, streak: 0, avgMood: null })
  const [recentEntries, setRecentEntries] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session ? { Authorization: `Bearer ${session.access_token}` } : {}
  }

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setProfile(user)

      const headers = await getHeaders()

      const [histRes, streakRes] = await Promise.all([
        fetch('http://localhost:8000/api/history?range=90', { headers }).then(r => r.ok ? r.json() : null),
        fetch('http://localhost:8000/api/habits/streak', { headers }).then(r => r.ok ? r.json() : null),
      ])

      const entries = histRes?.entries || []
      setRecentEntries(entries.slice(-10).reverse())

      const journalEntries = entries.filter(e => e.type === 'journal')
      setStats({
        totalJournals: journalEntries.length,
        streak: streakRes?.streak || 0,
        avgMood: journalEntries.length > 0
          ? Math.round(journalEntries.reduce((s, e) => s + (e.mood_score || 0), 0) / journalEntries.length)
          : null,
      })
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const stressLabel = (score) => {
    if (score == null) return '-'
    if (score >= 70) return { text: 'Tinggi', color: 'var(--color-pilar-darurat)' }
    if (score >= 40) return { text: 'Sedang', color: 'var(--color-pilar-sehat)' }
    return { text: 'Rendah', color: 'var(--color-pilar-bantuan)' }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto"
          style={{ borderColor: 'var(--color-pilar-stres)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
          style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
          {profile?.email?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
            {profile?.user_metadata?.full_name || 'Pengguna'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{profile?.email}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Bergabung {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '-'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-2xl border text-center bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <BookOpen className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-stres)' }} />
          <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{stats.totalJournals}</div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Jurnal</div>
        </div>
        <div className="p-4 rounded-2xl border text-center bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <Flame className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-sehat)' }} />
          <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{stats.streak}</div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Streak</div>
        </div>
        <div className="p-4 rounded-2xl border text-center bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-sosial)' }} />
          <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{stats.avgMood ?? '-'}</div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Rata Mood</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-2 mb-6">
        <button onClick={() => navigate('/sehat')}
          className="w-full flex items-center justify-between p-3 rounded-xl border bg-white hover:bg-[var(--color-surface)] transition-all cursor-pointer"
          style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>🧡 Log Kebiasaan Sehat</span>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </button>
        <button onClick={() => navigate('/literasi')}
          className="w-full flex items-center justify-between p-3 rounded-xl border bg-white hover:bg-[var(--color-surface)] transition-all cursor-pointer"
          style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>💙 Lihat Wawasan & Grafik</span>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* Recent Timeline */}
      <div className="p-5 rounded-2xl border bg-white mb-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" style={{ color: 'var(--color-pilar-bantuan)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-bantuan)' }}>Aktivitas Terbaru</span>
        </div>

        {recentEntries.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Belum ada aktivitas. Mulai tulis jurnal!</p>
          </div>
        )}

        {recentEntries.length > 0 && (
          <div className="space-y-2">
            {recentEntries.map((entry, i) => {
              const stress = stressLabel(entry.stress_score)
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: entry.type === 'mood' ? 'var(--color-pilar-stres)' : stress.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                        {new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {entry.type === 'mood' ? '😊 Mood' : '📝 Jurnal'}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {entry.sentiment_label || entry.note || '-'}
                      {entry.note && ` — ${entry.note}`}
                    </p>
                    <div className="flex gap-2 mt-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
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

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white cursor-pointer"
        style={{ backgroundColor: 'var(--color-pilar-darurat)' }}>
        <LogOut className="w-4 h-4" /> Keluar
      </button>
    </div>
  )
}
