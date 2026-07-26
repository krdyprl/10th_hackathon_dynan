import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, User, Bot, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const INISIAL = {
  role: 'assistant',
  content: 'Halo, aku di sini untukmu. Ceritakan apa yang kamu rasakan saat ini. Aku akan mendengarkan.',
}

export default function AiCompanionChat({ stressScore, onClose }) {
  const [messages, setMessages] = useState([INISIAL])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isStable, setIsStable] = useState(false)
  const [showDraft, setShowDraft] = useState(false)
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading || messages.length >= 6) return

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(API_BASE + '/api/ai-companion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ messages: newMessages.slice(-5), stress_score: stressScore }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

        if (data.is_crisis) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '🚨 Jika kamu dalam keadaan darurat, segera hubungi:\n\n• Hotline Kemenkes: 119 ext. 8\n• Into The Light: intothelightid.org\n• Yayasan Pulih: pulihfoundation.org\n\nKamu tidak sendirian.',
          }])
        }

        if (data.is_stable || newMessages.length >= 5) {
          setIsStable(true)
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Kelihatannya kamu sudah lebih tenang. Mungkin ini saat yang tepat untuk ngobrol dengan teman atau keluarga. Mau aku bantu buatkan draft pesan untuk mereka?',
            }])
          }, 1000)
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Maaf, aku sedang kesulitan merespon. Tapi aku di sini untukmu. Coba ceritakan lagi?',
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sepertinya ada gangguan koneksi. Tidak apa-apa, kita bisa coba lagi nanti.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDraft = () => {
    const nama = 'Teman'
    setDraft(`Hai ${nama}, akhir-akhir ini aku lagi agak berat. Bisa luangin waktu buat ngobrol?`)
    setShowDraft(true)
  }

  const copyDraft = () => {
    navigator.clipboard?.writeText(draft)
  }

  const isMaxExchange = messages.length >= 6

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl md:h-[600px] h-[85vh] flex flex-col shadow-xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" style={{ color: 'var(--color-pilar-stres)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Ngobrol Yuk</span>
          </div>
          <button onClick={onClose} className="cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--color-pilar-stres-soft)' }}>
                  <Bot className="w-4 h-4" style={{ color: 'var(--color-pilar-stres)' }} />
                </div>
              )}
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-white rounded-br-md'
                  : 'rounded-bl-md'
              }`} style={{
                backgroundColor: msg.role === 'user' ? 'var(--color-pilar-stres)' : 'var(--color-surface)',
                color: msg.role === 'user' ? 'white' : 'var(--color-text)',
              }}>
                {msg.content.split('\n').map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--color-text)' }}>
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Draft pesan */}
          {showDraft && (
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--color-pilar-sosial)', backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-pilar-sosial)' }}>📝 Draft pesan untuk Trusted Circle:</p>
              <p className="text-sm p-2 bg-white rounded-lg border italic" style={{ borderColor: 'var(--color-border)' }}>"{draft}"</p>
              <button onClick={copyDraft}
                className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg text-white cursor-pointer"
                style={{ backgroundColor: 'var(--color-pilar-sosial)' }}>
                📋 Salin & Kirim
              </button>
            </div>
          )}

          {!showDraft && isStable && (
            <button onClick={handleCreateDraft}
              className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer border"
              style={{ borderColor: 'var(--color-pilar-sosial)', color: 'var(--color-pilar-sosial)' }}>
              ✨ Bantu buat draft pesan
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-pilar-stres)' }} />
              Mengetik...
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {isMaxExchange ? (
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              Sudah cukup untuk hari ini. Saatnya terhubung dengan dunia nyata. 🫶
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ceritakan..."
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                disabled={loading}
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
