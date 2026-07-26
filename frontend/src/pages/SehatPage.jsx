import React from 'react'
import { Sun, Construction } from 'lucide-react'

export default function SehatPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center animate-fadeIn">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: 'var(--color-pilar-sehat-soft)' }}>
        <Sun className="w-7 h-7" style={{ color: 'var(--color-pilar-sehat)' }} />
      </div>
      <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Kebiasaan Sehat</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Log tidur & olahraga harian, streak, dan saran AI.</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
        style={{ backgroundColor: 'var(--color-pilar-sehat-soft)', color: 'var(--color-pilar-sehat)' }}>
        <Construction className="w-4 h-4" /> Segera hadir
      </div>
    </div>
  )
}
