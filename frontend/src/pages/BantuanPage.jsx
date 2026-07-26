import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function BantuanPage() {
  const [gpsLocation, setGpsLocation] = useState(null)
  const [helplines, setHelplines] = useState([])
  const [loadingHelplines, setLoadingHelplines] = useState(false)

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setLoadingHelplines(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setGpsLocation({ lat: latitude, lon: longitude })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) return
          const res = await fetch(`http://localhost:8000/api/helplines?lat=${latitude}&lon=${longitude}&radius=5000`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          if (res.ok) setHelplines((await res.json()).results || [])
        } catch {}
        setLoadingHelplines(false)
      },
      () => setLoadingHelplines(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12 py-8">
      <span className="text-[11px] font-semibold tracking-[0.1em] text-[#00d722] uppercase block mb-1">Akses Bantuan</span>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#080808] mb-6">Klinik & Psikolog Terdekat</h1>

      <div className="border-l-4 border-[#00d722] bg-[#f9fff9] rounded-r-[8px] p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[#5a5a5a]">
            {gpsLocation ? `Lokasi: ${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lon.toFixed(4)}` : 'Aktifkan GPS untuk mencari bantuan terdekat'}
          </p>
          <button onClick={detectLocation} disabled={loadingHelplines}
            className="bg-[#00d722] hover:bg-[#00c01f] text-white text-xs font-medium px-4 py-2 rounded-[4px] cursor-pointer disabled:opacity-50">
            {loadingHelplines ? 'Mendeteksi...' : gpsLocation ? 'Refresh' : 'Deteksi Lokasi'}
          </button>
        </div>

        {helplines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {helplines.slice(0, 6).map((p, i) => (
              <div key={i} className="bg-white border border-[#d8d8d8] p-4 rounded-[4px] text-xs">
                <strong className="text-[#080808] block mb-1">{p.name}</strong>
                {p.address && <p className="text-[#898989] mb-1">{p.address}</p>}
                {p.phone && <p className="text-[#3b89ff] mb-1">{p.phone}</p>}
                <span className="text-[10px] font-mono bg-[#00d722]/10 text-[#00d722] px-1.5 py-0.5 rounded">{p.type || 'Fasilitas'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#d8d8d8] p-4 rounded-[4px] text-xs">
              <strong className="text-[#080808] block">RSUD</strong>
              <p className="text-[#898989]">Poli Jiwa Terdekat</p>
              <span className="text-[10px] font-mono bg-[#00d722]/10 text-[#00d722] px-1.5 py-0.5 rounded">Rujukan GPS</span>
            </div>
            <div className="bg-white border border-[#d8d8d8] p-4 rounded-[4px] text-xs">
              <strong className="text-[#080808] block">Puskesmas</strong>
              <p className="text-[#898989]">Layanan Psikologi Klinis</p>
              <span className="text-[10px] font-mono bg-[#00d722]/10 text-[#00d722] px-1.5 py-0.5 rounded">Tarif Terjangkau</span>
            </div>
            <div className="bg-white border border-[#d8d8d8] p-4 rounded-[4px] text-xs">
              <strong className="text-[#080808] block">Into The Light</strong>
              <p className="text-[#898989]">Pencegahan bunuh diri</p>
              <a href="https://www.intothelightid.org" target="_blank" rel="noreferrer" className="text-[#3b89ff] hover:underline block text-[10px] mt-1">Kunjungi</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
