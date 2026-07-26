import React, { useState } from 'react'
import { AlertTriangle, Phone, ExternalLink, Wind, Shield } from 'lucide-react'
import BreathingGuide from '../components/BreathingGuide'

const hotlines = [
  { name: 'Hotline Kemenkes', detail: '119 ext. 8', type: 'phone', action: () => window.open('tel:119') },
  { name: 'Into The Light', detail: 'intothelightid.org', type: 'url', action: () => window.open('https://intothelightid.org', '_blank') },
  { name: 'Yayasan Pulih', detail: 'pulihfoundation.org', type: 'url', action: () => window.open('https://pulihfoundation.org', '_blank') },
  { name: 'PSYCHOLOGI Hotline', detail: '021-1234-5678', type: 'phone', action: () => window.open('tel:02112345678') },
]

const selfCareTips = [
  'Tarik napas dalam 4 detik, tahan 4, buang 4, tahan 4. Ulang.',
  'Minum air putih. Dehidrasi bisa memperburuk suasana hati.',
  'Langkah kecil: berdiri, regangkan tubuh selama 30 detik.',
  'Bicara dengan seseorang — kirim pesan ke Trusted Circle-mu.',
]

export default function DaruratPage() {
  const [showBreathing, setShowBreathing] = useState(false)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-darurat-soft)' }}>
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-pilar-darurat)' }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Pencegahan Risiko</h1>
      </div>

      {/* Hotline */}
      <div className="p-6 rounded-2xl border mb-4" style={{ borderColor: 'var(--color-pilar-darurat)', backgroundColor: 'var(--color-pilar-darurat-soft)' }}>
        <h2 className="text-base font-medium mb-1" style={{ color: 'var(--color-pilar-darurat)' }}>🆘 Butuh bantuan sekarang?</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Kamu tidak sendirian. Hubungi salah satu kontak berikut:</p>
        <div className="space-y-2">
          {hotlines.map((h, i) => (
            <button key={i} onClick={h.action}
              className="w-full flex justify-between items-center bg-white p-3 rounded-xl border text-sm cursor-pointer hover:shadow-sm transition-all"
              style={{ borderColor: 'var(--color-border)' }}>
              <strong style={{ color: 'var(--color-text)' }}>{h.name}</strong>
              <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--color-pilar-darurat)' }}>
                {h.detail}
                {h.type === 'url' ? <ExternalLink className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Self-Care Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <button onClick={() => setShowBreathing(true)}
          className="flex items-center gap-3 p-4 rounded-2xl border text-left bg-white cursor-pointer hover:shadow-sm transition-all"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-stres-soft)' }}>
            <Wind className="w-5 h-5" style={{ color: 'var(--color-pilar-stres)' }} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>🫁 Panduan Pernapasan</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Box breathing 4-4-4-4</div>
          </div>
        </button>

        <a href="https://wa.me/?text=Aku%20butuh%20teman%20ngobrol"
          target="_blank" rel="noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl border bg-white cursor-pointer hover:shadow-sm transition-all"
          style={{ borderColor: 'var(--color-border)', textDecoration: 'none' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-sosial-soft)' }}>
            <Shield className="w-5 h-5" style={{ color: 'var(--color-pilar-sosial)' }} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>💬 Chat Teman</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Buka WhatsApp</div>
          </div>
        </a>
      </div>

      {/* Self Care Tips */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: 'var(--color-pilar-darurat)' }}>
          Tips untuk Saat Ini
        </span>
        <div className="space-y-2">
          {selfCareTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="mt-0.5">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breathing Guide Modal */}
      {showBreathing && <BreathingGuide onClose={() => setShowBreathing(false)} />}
    </div>
  )
}
