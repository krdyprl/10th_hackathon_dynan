import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function DaruratPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-pilar-darurat-soft)' }}>
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-pilar-darurat)' }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Pencegahan Risiko</h1>
      </div>

      <div className="p-6 rounded-2xl border mb-4" style={{ borderColor: 'var(--color-pilar-darurat)', backgroundColor: 'var(--color-pilar-darurat-soft)' }}>
        <h2 className="text-base font-medium mb-1" style={{ color: 'var(--color-pilar-darurat)' }}>Butuh bantuan sekarang?</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Kamu tidak sendirian. Hubungi salah satu kontak berikut:</p>
        <div className="space-y-2">
          {[
            { name: 'Into The Light', detail: 'intothelightid.org', type: 'website' },
            { name: 'Hotline Kemenkes', detail: '119 ext. 8', type: 'phone' },
            { name: 'Yayasan Pulih', detail: 'pulihfoundation.org', type: 'website' },
            { name: 'PSYCHOLOGI Hotline', detail: '021-1234-5678', type: 'phone' },
          ].map((h, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border text-sm"
              style={{ borderColor: 'var(--color-border)' }}>
              <strong style={{ color: 'var(--color-text)' }}>{h.name}</strong>
              <span className="font-mono text-xs" style={{ color: 'var(--color-pilar-darurat)' }}>{h.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Riwayat Krisis</h2>
        <div className="text-center py-8">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Belum ada riwayat krisis.</p>
        </div>
      </div>
    </div>
  )
}
