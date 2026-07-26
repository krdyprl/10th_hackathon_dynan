import React from 'react'

export default function CrisisModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-pilar-darurat)' }}>
      <div className="max-w-lg w-full text-center space-y-6 text-white animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto text-3xl font-bold"
          style={{ color: 'var(--color-pilar-darurat)' }}>⚠</div>
        <h2 className="text-2xl md:text-3xl font-semibold">Crisis Helpline Alert</h2>
        <p className="text-base leading-relaxed opacity-90">
          Halo, sistem mendeteksi indikasi stres ekstrem dari tulisan Anda. Anda tidak sendirian. Silakan hubungi bantuan berikut:
        </p>
        <div className="bg-white/10 border border-white/20 p-4 rounded-xl space-y-2 text-sm text-left">
          <div className="flex justify-between border-b border-white/10 pb-1.5">
            <strong>Into The Light:</strong>
            <span className="font-mono text-xs">intothelightid.org</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-1.5">
            <strong>Hotline Kemenkes:</strong>
            <span className="font-mono text-xs">119 ext. 8</span>
          </div>
          <div className="flex justify-between">
            <strong>Yayasan Pulih:</strong>
            <span className="font-mono text-xs">pulihfoundation.org</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-white font-medium text-sm py-3 px-8 rounded-xl transition-all hover:bg-white/95 cursor-pointer"
          style={{ color: 'var(--color-pilar-darurat)' }}
        >
          Saya Mengerti & Aman
        </button>
      </div>
    </div>
  )
}
