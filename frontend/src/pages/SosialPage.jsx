import React, { useState, useEffect } from 'react'
import { Heart, Plus, Trash2, Send, Sparkles, Mail, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SosialPage() {
  const [contacts, setContacts] = useState([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('email')
  const [newValue, setNewValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState(null)

  // Notifikasi state
  const [customMessage, setCustomMessage] = useState('')
  const [stressScore, setStressScore] = useState(50)
  const [notifStatus, setNotifStatus] = useState(null) // null | 'sending' | {sent, total, results}
  const [notifError, setNotifError] = useState(null)

  // Draft jembatan
  const [showJembatan, setShowJembatan] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => { loadContacts() }, [])

  const getHeaders = async (json = true) => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    }
  }

  const loadContacts = async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch(API_BASE + '/api/trusted-circles', { headers })
      if (res.ok) setContacts((await res.json()).contacts || [])
    } catch {}
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !newValue.trim()) return
    setSaving(true)
    setAddError(null)
    try {
      const headers = await getHeaders()
      const res = await fetch(API_BASE + '/api/trusted-circles', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contact_name: newName.trim(),
          contact_type: newType,
          contact_value: newValue.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setContacts(p => [...p, data.data])
        setNewName(''); setNewValue('')
      } else {
        const err = await res.json().catch(() => ({}))
        setAddError(err.detail || `Gagal tambah kontak (${res.status})`)
      }
    } catch {
      setAddError('Tidak bisa terhubung ke backend')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      const headers = await getHeaders()
      await fetch(`${API_BASE}/api/trusted-circles/${id}`, { method: 'DELETE', headers })
      setContacts(p => p.filter(c => c.id !== id))
    } catch {}
  }

  const handleNotify = async () => {
    setNotifStatus('sending')
    setNotifError(null)
    try {
      const headers = await getHeaders()
      const res = await fetch(API_BASE + '/api/notify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          custom_message: customMessage.trim() || null,
          stress_score: stressScore,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setNotifStatus(data)
      } else {
        const err = await res.json().catch(() => ({}))
        setNotifError(err.detail || `Gagal kirim (${res.status})`)
        setNotifStatus(null)
      }
    } catch {
      setNotifError('Tidak bisa terhubung ke backend')
      setNotifStatus(null)
    }
    setTimeout(() => { setNotifStatus(null); setNotifError(null) }, 6000)
  }

  const getJembatanDraft = () => {
    setShowJembatan(true)
    const templates = [
      'Hai, akhir-akhir ini aku lagi agak berat. Ada waktu buat ngobrol?',
      'Halo, aku cuma mau bilang kalau hari ini aku lagi butuh teman. Ada waktu?',
      'Hei, lagi sibuk? Kalau ada waktu, aku mau cerita sedikit.',
      'Hai, aku lagi kurang baik-baik aja. Boleh ngobrol bentar?',
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    setDraft(t)
    setCustomMessage(t)
  }

  const emailContacts = contacts.filter(c => c.contact_type === 'email')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
          <Heart className="w-5 h-5" style={{ color: 'var(--color-pilar-sosial)' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Dukungan Sosial</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Trusted Circle & Notifikasi</p>
        </div>
      </div>

      {/* Jembatan */}
      <div className="p-5 rounded-2xl border" style={{ borderColor: 'var(--color-pilar-sosial)', backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--color-pilar-sosial)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Jembatan — Bantu Tulis Pesan</span>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Susah mulai ngomong? Biar aku bantu.</p>
        {!showJembatan ? (
          <button onClick={getJembatanDraft}
            className="text-xs font-medium px-4 py-2 rounded-xl text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
            ✨ Bantu Aku Tulis Pesan
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-xl border italic text-sm" style={{ borderColor: 'var(--color-border)' }}>
              "{draft}"
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard?.writeText(draft)}
                className="text-xs font-medium px-4 py-2 rounded-xl text-white cursor-pointer"
                style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
                📋 Salin
              </button>
              <button onClick={() => setShowJembatan(false)}
                className="text-xs px-3 py-2 rounded-xl border cursor-pointer"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trusted Circle List */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: 'var(--color-pilar-sosial)' }}>
          👥 Trusted Circle ({contacts.length})
        </span>

        {loading ? (
          <div className="text-center py-4">
            <div className="w-4 h-4 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-pilar-sosial)', borderTopColor: 'transparent' }} />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
            <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada kontak. Tambah orang terdekatmu di bawah.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
                    {c.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{c.contact_name}</div>
                    <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                      {c.contact_type === 'email'
                        ? <><Mail className="w-3 h-3" /> {c.contact_value}</>
                        : <><MessageCircle className="w-3 h-3" /> {c.contact_value}</>
                      }
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)}
                  className="cursor-pointer p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#9ca3af' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Form */}
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="text" placeholder="Nama kontak" value={newName} onChange={e => setNewName(e.target.value)}
              className="px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }} required />
            <select value={newType} onChange={e => setNewType(e.target.value)}
              className="px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <option value="email">📧 Email</option>
              <option value="whatsapp">📱 WhatsApp</option>
            </select>
            <input type="text"
              placeholder={newType === 'email' ? 'email@contoh.com' : '08123456789'}
              value={newValue} onChange={e => setNewValue(e.target.value)}
              className="px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }} required />
          </div>
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
            <Plus className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Tambah Kontak'}
          </button>
          {addError && (
            <p className="text-xs text-center" style={{ color: '#ef4444' }}>⚠️ {addError}</p>
          )}
        </form>
      </div>

      {/* Kirim Notifikasi ke Trusted Circle */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Send className="w-5 h-5" style={{ color: 'var(--color-pilar-sosial)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Kirim Kondisiku via Email</span>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Kirim email ke kontak Trusted Circle kamu agar mereka tahu kamu mungkin butuh dukungan.
          {emailContacts.length === 0 && contacts.length > 0 && (
            <span className="ml-1 text-amber-600">⚠️ Belum ada kontak Email — tambah kontak email dulu.</span>
          )}
        </p>

        {/* Slider stres */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
            <span>Kondisi hari ini</span>
            <span className="font-medium" style={{ color: stressScore >= 70 ? '#ef4444' : stressScore >= 40 ? '#f59e0b' : '#22c55e' }}>
              {stressScore >= 70 ? '😰 Stres Tinggi' : stressScore >= 40 ? '😐 Agak Berat' : '😊 Oke-oke Aja'} ({stressScore})
            </span>
          </div>
          <input type="range" min="0" max="100" value={stressScore}
            onChange={e => setStressScore(parseInt(e.target.value))}
            className="w-full accent-[var(--color-pilar-sosial)]" />
        </div>

        {/* Pesan personal */}
        <div className="mb-4">
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Pesan personal (opsional)
          </label>
          <textarea
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            placeholder="Tulis pesan tambahan untuk kontakmu... atau klik 'Bantu Tulis Pesan' di atas"
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <button
          onClick={handleNotify}
          disabled={contacts.length === 0 || notifStatus === 'sending' || emailContacts.length === 0}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-40 transition-all"
          style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
          {notifStatus === 'sending'
            ? '⏳ Mengirim email...'
            : `📧 Kirim ke ${emailContacts.length} kontak email`}
        </button>

        {/* Hasil notifikasi */}
        {notifStatus && notifStatus !== 'sending' && (
          <div className="mt-3 p-3 rounded-xl text-sm animate-fadeIn"
            style={{
              backgroundColor: notifStatus.sent > 0 ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${notifStatus.sent > 0 ? '#86efac' : '#fca5a5'}`,
              color: notifStatus.sent > 0 ? '#166534' : '#dc2626',
            }}>
            {notifStatus.sent > 0
              ? <><CheckCircle className="w-4 h-4 inline mr-1" />✅ Terkirim ke {notifStatus.sent} dari {notifStatus.total} kontak!</>
              : <><AlertCircle className="w-4 h-4 inline mr-1" />⚠️ Tidak ada email yang terkirim. Cek RESEND_API_KEY di backend.</>
            }
            {/* Detail per kontak */}
            {notifStatus.results?.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs">
                {notifStatus.results.map((r, i) => (
                  <li key={i} className="flex items-center gap-1">
                    {r.status === 'sent' ? '✓' : r.status === 'skipped' ? '○' : '✗'} {r.to}
                    {r.status !== 'sent' && r.reason && <span className="opacity-60">({r.reason})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {notifError && (
          <div className="mt-3 p-3 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
            ❌ {notifError}
          </div>
        )}
      </div>
    </div>
  )
}
