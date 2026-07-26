import React, { useState } from 'react'
import { MapPin, Phone, Clock, Navigation, Building, ExternalLink, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function BantuanPage() {
  const [gpsLocation, setGpsLocation] = useState(null)
  const [helplines, setHelplines] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const detectLocation = () => {
    if (!navigator.geolocation) { setError('GPS tidak didukung browser'); return }
    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setGpsLocation({ lat: latitude, lon: longitude })

        try {
          const { data: { session } } = await supabase.auth.getSession()
          const res = await fetch(
            `http://localhost:8000/api/helplines?lat=${latitude}&lon=${longitude}&radius=5000`,
            { headers: session ? { Authorization: `Bearer ${session.access_token}` } : {} }
          )
          if (res.ok) setHelplines((await res.json()).results || [])
          else setError('Gagal memuat data')
        } catch { setError('Gagal menghubungi server') }
        setLoading(false)
      },
      () => { setError('Izin lokasi ditolak. Aktifkan di pengaturan browser.'); setLoading(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const openMap = (lat, lon) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-pilar-bantuan-soft)' }}>
          <MapPin className="w-5 h-5" style={{ color: 'var(--color-pilar-bantuan)' }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Bantuan Terdekat</h1>
      </div>

      {/* GPS Status */}
      <div className="p-5 rounded-2xl border mb-4" style={{ borderColor: 'var(--color-pilar-bantuan)', backgroundColor: 'var(--color-pilar-bantuan-soft)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Lokasi Saat Ini</p>
            {gpsLocation && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {gpsLocation.lat.toFixed(4)}, {gpsLocation.lon.toFixed(4)}
              </p>
            )}
          </div>
          <button onClick={detectLocation} disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl text-white cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-pilar-bantuan)' }}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {loading ? 'Mendeteksi...' : gpsLocation ? 'Refresh' : 'Deteksi Lokasi'}
          </button>
        </div>
        {!gpsLocation && !loading && (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Tekan tombol Deteksi Lokasi untuk mencari klinik & psikolog terdekat.
          </p>
        )}
        {error && (
          <div className="mt-3 p-3 rounded-xl text-xs" style={{ backgroundColor: 'var(--color-pilar-darurat-soft)', color: 'var(--color-pilar-darurat)' }}>
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {gpsLocation && !loading && (
        <div className="space-y-3">
          {helplines.length === 0 && !error && (
            <div className="p-6 rounded-2xl border bg-white text-center" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Tidak ditemukan fasilitas kesehatan di sekitar.</p>
            </div>
          )}

          {helplines.map((place, i) => (
            <div key={i} className="p-5 rounded-2xl border bg-white hover:shadow-sm transition-all"
              style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-pilar-bantuan)' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{place.name}</h3>
                </div>
                {place.distance_km && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--color-pilar-bantuan-soft)', color: 'var(--color-pilar-bantuan)' }}>
                    {place.distance_km} km
                  </span>
                )}
              </div>

              <div className="space-y-1.5 ml-7">
                {place.address && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    {place.address}
                  </div>
                )}
                {place.phone && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <Phone className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    {place.phone}
                  </div>
                )}
                {place.opening_hours && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    {place.opening_hours}
                  </div>
                )}
                {place.website && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-pilar-literasi)' }}>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <a href={place.website} target="_blank" rel="noreferrer" className="hover:underline">{place.website}</a>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--color-border)' }}>
                    {place.type || 'Fasilitas'}
                  </span>
                </div>
              </div>

              {place.lat && place.lon && (
                <button onClick={() => openMap(place.lat, place.lon)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl border cursor-pointer hover:bg-[var(--color-surface)]"
                  style={{ borderColor: 'var(--color-pilar-bantuan)', color: 'var(--color-pilar-bantuan)' }}>
                  <Navigation className="w-3.5 h-3.5" /> Petunjuk Arah (Google Maps)
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hotline Tetap */}
      <div className="mt-6 p-5 rounded-2xl border" style={{ borderColor: 'var(--color-pilar-darurat)', backgroundColor: 'var(--color-pilar-darurat-soft)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: 'var(--color-pilar-darurat)' }}>
          🆘 Butuh Bantuan Sekarang?
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { name: 'Kemenkes', detail: '119 ext. 8' },
            { name: 'Into The Light', detail: 'intothelightid.org' },
            { name: 'Yayasan Pulih', detail: 'pulihfoundation.org' },
          ].map((h, i) => (
            <div key={i} className="bg-white p-3 rounded-xl border text-center" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{h.name}</div>
              <div className="text-xs font-mono mt-1" style={{ color: 'var(--color-pilar-darurat)' }}>{h.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
