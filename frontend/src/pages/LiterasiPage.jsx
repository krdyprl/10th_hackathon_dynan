import React, { useEffect, useState } from 'react'
import { HandwritingRadarChart } from '../components/HandwritingRadarChart'
import { MoodTrendChart } from '../components/MoodTrendChart'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function LiterasiPage() {
  const { analysisResult, radarData, moodTrend, setMoodTrend } = useApp()
  const [historyRange, setHistoryRange] = useState(7)
  const [timeline, setTimeline] = useState([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const res = await fetch(`http://localhost:8000/api/history?range=${historyRange}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.entries?.length > 0) {
          const trendData = data.entries.map(e => ({
            date: new Date(e.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
            mood: e.mood_score,
          }))
          const timelineData = data.entries.map(e => ({
            ...e,
            dateFormatted: new Date(e.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
            time: new Date(e.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          }))
          setTimeline(timelineData.reverse())
          if (analysisResult?.future_mood_prediction) {
            const p = analysisResult.future_mood_prediction
            trendData.push({ date: 'H+1', mood: p[0] }, { date: 'H+2', mood: p[1] }, { date: 'H+3', mood: p[2] }, { date: 'H+4', mood: p[3] })
          }
          setMoodTrend(trendData)
        }
      } catch {}
    }
    fetchHistory()
  }, [historyRange])

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoadingTimeline(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const res = await fetch('http://localhost:8000/api/history?range=30', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.entries) {
          setTimeline(data.entries.map(e => ({
            ...e,
            dateFormatted: new Date(e.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
            time: new Date(e.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          })).reverse())
        }
      } catch {}
      setLoadingTimeline(false)
    }
    fetchTimeline()
  }, [])

  const stressLevel = (score) => {
    if (score >= 70) return { label: 'Tinggi', color: '#ee1d36' }
    if (score >= 40) return { label: 'Sedang', color: '#ffae13' }
    return { label: 'Rendah', color: '#00d722' }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12 py-8">
      <span className="text-[11px] font-semibold tracking-[0.1em] text-[#3b89ff] uppercase block mb-1">Literasi & AI</span>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#080808] mb-6">Wawasan Kesehatan Mental</h1>

      {/* Moodmu vs Hasil AI */}
      {analysisResult && (
        <div className="mb-6 p-6 bg-white border border-[#d8d8d8] rounded-[8px]">
          <span className="text-[11px] font-semibold tracking-[0.1em] text-[#7a3dff] uppercase block mb-3">Moodmu vs Hasil AI</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#f5f0ff] rounded border border-[#7a3dff]/20 text-center">
              <span className="text-[10px] font-mono text-[#898989] uppercase">Kamu merasa</span>
              <div className="text-2xl font-semibold text-[#7a3dff] mt-1">{analysisResult.mood_score || '-'}/100</div>
              <div className="w-full bg-[#e0d0ff] rounded-full h-2 mt-2">
                <div className="bg-[#7a3dff] h-2 rounded-full" style={{ width: `${analysisResult.mood_score || 0}%` }} />
              </div>
              <span className="text-xs text-[#898989] mt-1 block">Mood Score AI</span>
            </div>
            <div className="p-4 bg-[#fff5f0] rounded border border-[#ff6b00]/20 text-center">
              <span className="text-[10px] font-mono text-[#898989] uppercase">Data menunjukkan</span>
              <div className="text-2xl font-semibold text-[#ff6b00] mt-1">{analysisResult.stress_score || '-'}/100</div>
              <div className="w-full bg-[#ffe0d0] rounded-full h-2 mt-2">
                <div className="bg-[#ff6b00] h-2 rounded-full" style={{ width: `${analysisResult.stress_score || 0}%` }} />
              </div>
              <span className="text-xs text-[#898989] mt-1 block">Stress Score AI</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-[#fafafa] rounded border border-[#d8d8d8] text-xs text-center text-[#363636]">
            Sentimen terdeteksi: <strong className="text-[#7a3dff]">{analysisResult.sentiment_label}</strong> (score: {analysisResult.sentiment_score})
          </div>
        </div>
      )}

      {!analysisResult && (
        <div className="mb-6 p-6 bg-[#f5f0ff] border border-[#d8d8d8] rounded-[8px] text-center">
          <p className="text-sm text-[#898989]">Belum ada analisis. Tulis jurnal dulu di halaman <strong>✏️ Tulis</strong> untuk melihat perbandingan.</p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-[#d8d8d8] rounded-[8px] p-6">
          <span className="text-[11px] font-semibold tracking-[0.1em] text-[#7a3dff] uppercase block mb-1">Fisik</span>
          <h4 className="text-lg font-medium text-[#080808] mb-3">Radar Kinematika</h4>
          <HandwritingRadarChart data={radarData} />
          <p className="text-[11px] text-[#898989] font-mono mt-3">Kecepatan, akselerasi, tremor, angkatan pena, hapusan.</p>
        </div>
        <div className="bg-white border border-[#d8d8d8] rounded-[8px] p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#3b89ff] uppercase block mb-1">Mental</span>
              <h4 className="text-lg font-medium text-[#080808]">Tren Mood</h4>
            </div>
            <select value={historyRange} onChange={e => setHistoryRange(parseInt(e.target.value))}
              className="text-xs bg-white border border-[#d8d8d8] rounded-[4px] px-2 py-1 outline-none focus:border-[#3b89ff]">
              <option value={7}>7 hari</option>
              <option value={30}>30 hari</option>
              <option value={90}>90 hari</option>
            </select>
          </div>
          <MoodTrendChart data={moodTrend} />
          <p className="text-[11px] text-[#898989] font-mono mt-3">Riwayat mood + prediksi 4 hari ke depan.</p>
        </div>
      </div>

      {/* AI Insight Detail */}
      {analysisResult && (
        <div className="border border-[#d8d8d8] rounded-[8px] bg-white p-6 mb-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#3b89ff] uppercase block mb-1">Refleksi LLM</span>
              <h4 className="text-lg font-medium text-[#080808]">Hasil Analisis AI</h4>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#fafafa] border border-[#d8d8d8] rounded-[4px]">
              {analysisResult.sentiment_label} <strong className="text-[#7a3dff]">({analysisResult.sentiment_score})</strong>
            </span>
          </div>
          <div className="border-t border-[#d8d8d8] pt-3 space-y-3 text-xs text-[#363636]">
            {analysisResult.ocr_text && (
              <div>
                <strong className="text-[#080808] block mb-0.5">Teks Terdeteksi (OCR):</strong>
                <p className="bg-[#fafafa] p-2 rounded border border-[#d8d8d8] font-mono italic">"{analysisResult.ocr_text}"</p>
              </div>
            )}
            <div><strong className="text-[#080808] block mb-0.5">Wawasan:</strong><p>{analysisResult.handwriting_insights}</p></div>
            <div><strong className="text-[#080808] block mb-0.5">Korelasi:</strong><p>{analysisResult.mood_stress_correlation}</p></div>
            <div className="p-3 bg-[#f9fcff] border-l-2 border-[#3b89ff] rounded-r">
              <strong className="text-[#3b89ff] block mb-0.5">Rekomendasi:</strong>
              <p className="font-medium">{analysisResult.recommendations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Insight */}
      <div className="border border-[#d8d8d8] rounded-[8px] bg-white p-6">
        <span className="text-[11px] font-semibold tracking-[0.1em] text-[#00d722] uppercase block mb-1">Riwayat</span>
        <h4 className="text-lg font-medium text-[#080808] mb-4">Timeline Insight</h4>

        {loadingTimeline && (
          <div className="text-center py-8">
            <div className="w-5 h-5 border-2 border-[#00d722] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {!loadingTimeline && timeline.length === 0 && (
          <div className="text-center py-8 text-[#898989] text-sm">
            Belum ada data jurnal. Mulai tulis di halaman ✏️ Tulis.
          </div>
        )}

        {timeline.length > 0 && (
          <div className="space-y-4">
            {timeline.slice().reverse().map((entry, i) => {
              const stress = stressLevel(entry.stress_score)
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stress.color }} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-[#d8d8d8]" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#080808]">{entry.dateFormatted}</span>
                      <span className="text-[10px] font-mono text-[#898989]">{entry.time}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-[#363636]">{entry.sentiment_label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${stress.color}15`, color: stress.color }}>
                        Stres {stress.label}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-3 text-[10px] text-[#898989] font-mono">
                      <span>Mood: {entry.mood_score}</span>
                      <span>Stress: {entry.stress_score}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
