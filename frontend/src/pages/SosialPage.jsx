import React, { useState, useEffect } from 'react'
import { Heart, Plus, Trash2, Send, MessageCircle, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SosialPage() {
  const [contacts, setContacts] = useState([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('email')
  const [newValue, setNewValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(null)
  const [showJembatan, setShowJembatan] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => { loadContacts() }, [])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
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
    if (!newName || !newValue) return
    setSaving(true)
    try {
      const headers = await getHeaders()
      const res = await fetch(API_BASE + '/api/trusted-circles', {
        method: 'POST',
        headers,
        body: JSON.stringify({ contact_name: newName, contact_type: newType, contact_value: newValue }),
      })
      if (res.ok) {
        const data = await res.json()
        setContacts(p => [...p, data.data])
      }
    } catch {}
    setNewName(''); setNewValue(''); setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      const headers = await getHeaders()
      await fetch(`${API_BASE}/api/trusted-circles/${id}`, { method: 'DELETE', headers })
      setContacts(p => p.filter(c => c.id !== id))
    } catch {}
  }

  const handleNotify = async () => {
    setNotificationStatus('sending')
    try {
      const headers = await getHeaders()
      const res = await fetch(API_BASE + '/api/notify', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      })
      if (res.ok) setNotificationStatus('sent')
      else setNotificationStatus('failed')
    } catch { setNotificationStatus('failed') }
    setTimeout(() => setNotificationStatus(null), 4000)
  }

  const getJembatanDraft = async () => {
    setShowJembatan(true)
    const templates = [
      'Hai, akhir-akhir ini aku lagi agak berat. Ada waktu buat ngobrol?',
      'Halo, aku cuma mau bilang kalau hari ini aku lagi butuh teman. Ada waktu?',
      'Hei, lagi sibuk? Kalau ada waktu, aku mau cerita sedikit.',
    ]
    setDraft(templates[Math.floor(Math.random() * templates.length)])
  }

  const copyDraft = () => navigator.clipboard?.writeText(draft)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
          <Heart className="w-5 h-5" style={{ color: 'var(--color-pilar-sosial)' }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Dukungan Sosial</h1>
      </div>

      {/* Jembatan — Bantuan Tulis Pesan */}
      <div className="p-5 rounded-2xl border mb-4" style={{ borderColor: 'var(--color-pilar-sosial)', backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--color-pilar-sosial)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Jembatan — Bantu Tulis Pesan</span>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Susah memulai pesan? Biaya aku bantu.
        </p>
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
            <button onClick={copyDraft}
              className="text-xs font-medium px-4 py-2 rounded-xl text-white cursor-pointer"
              style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
              📋 Salin & Kirim ke Kontak
            </button>
          </div>
        )}
      </div>

      {/* Trusted Circle List */}
      <div className="p-5 rounded-2xl border mb-4 bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: 'var(--color-pilar-sosial)' }}>
          Trusted Circle
        </span>

        {loading ? (
          <div className="text-center py-4">
            <div className="w-4 h-4 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-pilar-sosial)', borderTopColor: 'transparent' }} />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-sm">Belum ada kontak. Tambah kontak terdekatmu.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white"
                    style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
                    {c.contact_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{c.contact_name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {c.contact_type === 'email' ? '📧' : '📱'} {c.contact_value}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)}
                  className="cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Form */}
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input type="text" placeholder="Nama" value={newName} onChange={e => setNewName(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }} required />
          <select value={newType} onChange={e => setNewType(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <input type="text" placeholder="Email / WA" value={newValue} onChange={e => setNewValue(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }} required />
          <button type="submit" disabled={saving}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </form>
      </div>

      {/* Notifikasi */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Send className="w-5 h-5" style={{ color: 'var(--color-pilar-sosial)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-sosial)' }}>Kirim Notifikasi</span>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Kirim notifikasi sapaan ke semua kontak Trusted Circle.
        </p>
        <button onClick={handleNotify} disabled={contacts.length === 0 || notificationStatus === 'sending'}
          className="text-xs font-medium px-4 py-2 rounded-xl text-white cursor-pointer disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
          {notificationStatus === 'sending' ? 'Mengirim...' :
           notificationStatus === 'sent' ? '✓ Notifikasi Terkirim' :
           'Kirim Notifikasi Uji Coba'}
        </button>
        {notificationStatus === 'sent' && (
          <div className="mt-3 p-3 rounded-xl text-xs font-medium text-center animate-fadeIn"
            style={{ backgroundColor: 'var(--color-pilar-bantuan-soft)', color: 'var(--color-pilar-bantuan)' }}>
            ✅ Notifikasi berhasil dikirim ke {contacts.length} kontak!
          </div>
        )}
        {notificationStatus === 'failed' && (
          <div className="mt-3 p-3 rounded-xl text-xs font-medium text-center animate-fadeIn"
            style={{ backgroundColor: 'var(--color-pilar-darurat-soft)', color: 'var(--color-pilar-darurat)' }}>
            ❌ Gagal mengirim. Pastikan Resend API sudah dikonfigurasi.
          </div>
        )}
      </div>
    </div>
  )
}
