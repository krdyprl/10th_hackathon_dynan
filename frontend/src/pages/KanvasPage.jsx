import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { JournalCanvas } from '../components/JournalCanvas'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

const guidedPrompts = [
  { id: 1, text: 'Apa yang paling saya syukuri hari ini?' },
  { id: 2, text: 'Satu hal yang membuat saya tersenyum hari ini...' },
  { id: 3, text: 'Apa yang sedang memberatkan pikiran saya?' },
  { id: 4, text: 'Jika hari ini bisa saya ulang, saya akan...' },
  { id: 5, text: 'Bagaimana saya memperlakukan diri sendiri hari ini?' },
  { id: 6, text: 'Tiga kata yang menggambarkan hari saya...' },
  { id: 7, text: 'Apa yang saya butuhkan saat ini?' },
  { id: 8, text: 'Satu hal yang ingin saya lepaskan...' },
]

const analysisStages = [
  { id: 'ocr', label: 'OCR: Membaca tulisan tangan...', emoji: '🔍' },
  { id: 'kinematics', label: 'AI: Menganalisis gerakan tulisan...', emoji: '📐' },
  { id: 'sentiment', label: 'AI: Memahami emosi & makna...', emoji: '🧠' },
  { id: 'recommendations', label: 'Menyusun rekomendasi personal...', emoji: '💡' },
]

export default function KanvasPage() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [strokes, setStrokes] = useState([])
  const [eraseCount, setEraseCount] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDetoxActive, setIsDetoxActive] = useState(false)
  const [detoxTimer, setDetoxTimer] = useState(120)
  const [moodBefore, setMoodBefore] = useState(5)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [analysisStage, setAnalysisStage] = useState(0)
  const [analysisDone, setAnalysisDone] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const { setAnalysisResult, setRadarData, setMoodTrend, setShowCrisisModal } = useApp()

  useEffect(() => {
    if (strokes.length > 0 && !isTimerActive) setIsTimerActive(true)
  }, [strokes, isTimerActive])

  useEffect(() => {
    let interval
    if (isTimerActive && !loading) {
      interval = setInterval(() => setDurationSeconds(d => d + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive, loading])

  useEffect(() => {
    let detoxInterval
    if (isDetoxActive && detoxTimer > 0) {
      detoxInterval = setInterval(() => setDetoxTimer(t => t - 1), 1000)
    } else if (detoxTimer === 0) setIsDetoxActive(false)
    return () => clearInterval(detoxInterval)
  }, [isDetoxActive, detoxTimer])

  useEffect(() => {
    if (!loading) return
    if (analysisStage >= analysisStages.length) return
    const timer = setTimeout(() => setAnalysisStage(s => s + 1), 800)
    return () => clearTimeout(timer)
  }, [loading, analysisStage])

  const base64ToBlob = (base64Str, mimeType) => {
    const byteString = atob(base64Str.split(',')[1])
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    return new Blob([ab], { type: mimeType })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setAnalysisStage(0)
    setAnalysisDone(false)
    setErrorMsg('')

    try {
      const base64Image = await canvasRef.current?.exportImage()
      if (!base64Image) throw new Error('Kanvas masih kosong.')

      const formData = new FormData()
      formData.append('file', base64ToBlob(base64Image, 'image/png'), 'journal.png')
      formData.append('strokes_json', JSON.stringify(strokes))
      formData.append('sleep_hours', 7)
      formData.append('erase_count', parseInt(eraseCount))
      formData.append('duration_seconds', parseInt(durationSeconds) || 5)
      formData.append('exercise_status', 'no')

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        body: formData
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Gagal analisis.')
      }

      const result = await res.json()
      setLastResult(result)
      setAnalysisResult(result)

      setRadarData([
        { subject: 'Kecepatan', value: Math.min(100, Math.round((result.kinematics?.average_velocity || 0) * 1.5)) },
        { subject: 'Akselerasi', value: Math.min(100, Math.round((result.kinematics?.average_acceleration || 0) * 10)) },
        { subject: 'Jerk (Tremor)', value: Math.min(100, Math.round((result.kinematics?.jerk_score || 0) * 0.5)) },
        { subject: 'Pen Lifts', value: Math.min(100, Math.round((result.kinematics?.pen_lifts || 0) * 12)) },
        { subject: 'Erase Count', value: Math.min(100, Math.round((result.kinematics?.erase_count || 0) * 20)) },
      ])

      if (result.future_mood_prediction) {
        setMoodTrend([
          { date: 'Hari -3', mood: 65 }, { date: 'Hari -2', mood: 70 }, { date: 'Hari -1', mood: 58 },
          { date: 'Hari ini', mood: result.mood_score || 50 },
          { date: 'H+1', mood: result.future_mood_prediction[0] || 50 },
          { date: 'H+2', mood: result.future_mood_prediction[1] || 55 },
          { date: 'H+3', mood: result.future_mood_prediction[2] || 60 },
          { date: 'H+4', mood: result.future_mood_prediction[3] || 65 },
        ])
      }

      const criticalKeywords = ['bunuh diri', 'menyerah', 'akhiri hidup', 'self-harm', 'potong urat', 'mati saja', 'ingin mati']
      if (criticalKeywords.some(k => (result.ocr_text || '').toLowerCase().includes(k))) {
        setShowCrisisModal(true)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal.')
      const mock = {
        ocr_text: 'Refleksi hari ini cukup berat...',
        sentiment_label: 'Anxious', sentiment_score: 75,
        handwriting_insights: 'Tekanan stabil, tremor halus.',
        mood_stress_correlation: 'Kurang tidur + tidak olahraga.',
        recommendations: 'Box breathing: 4-4-4-4, 5 siklus.',
        stress_score: 65, mood_score: 45,
        future_mood_prediction: [50, 60, 68, 75]
      }
      setLastResult(mock)
      setAnalysisResult(mock)
      setRadarData([
        { subject: 'Kecepatan', value: 65 }, { subject: 'Akselerasi', value: 45 },
        { subject: 'Jerk (Tremor)', value: 50 }, { subject: 'Pen Lifts', value: 40 },
        { subject: 'Erase Count', value: eraseCount * 20 }
      ])
      setMoodTrend([
        { date: 'Hari -3', mood: 65 }, { date: 'Hari -2', mood: 70 }, { date: 'Hari -1', mood: 58 },
        { date: 'Hari ini', mood: mock.mood_score },
        { date: 'H+1', mood: mock.future_mood_prediction[0] },
        { date: 'H+2', mood: mock.future_mood_prediction[1] },
        { date: 'H+3', mood: mock.future_mood_prediction[2] },
        { date: 'H+4', mood: mock.future_mood_prediction[3] },
      ])
    } finally {
      setLoading(false)
      setAnalysisDone(true)
    }
  }

  const handleReset = () => {
    canvasRef.current?.clear()
    setStrokes([])
    setEraseCount(0)
    setDurationSeconds(0)
    setIsTimerActive(false)
    setErrorMsg('')
    setAnalysisDone(false)
    setLastResult(null)
  }

  const handleGoToInsight = () => navigate('/literasi')

  const stage = analysisStages[analysisStage] || analysisStages[analysisStages.length - 1]

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-8">
      {/* Check-in Mood */}
      <div className="mb-6 p-4 bg-[#f5f0ff] border-l-4 border-[#7a3dff] rounded-r-[8px]">
        <span className="text-[11px] font-semibold tracking-[0.1em] text-[#7a3dff] uppercase block mb-1">Check-in</span>
        <h4 className="text-sm font-medium text-[#080808] mb-2">Bagaimana perasaanmu sekarang?</h4>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#898989]">Tenang</span>
          <input type="range" min="1" max="10" value={moodBefore} onChange={e => setMoodBefore(e.target.value)} className="flex-1 accent-[#7a3dff]" />
          <span className="text-xs text-[#898989]">Cemas</span>
          <span className="text-sm font-mono font-semibold text-[#7a3dff] min-w-[24px]">{moodBefore}/10</span>
        </div>
      </div>

      {/* Guided Prompt */}
      {!analysisDone && (
        <div className="mb-4 p-4 bg-white border border-[#d8d8d8] rounded-[8px]">
          <span className="text-[11px] font-semibold tracking-[0.1em] text-[#7a3dff] uppercase block mb-2">Prompt Refleksi</span>
          <p className="text-xs text-[#898989] mb-3">Pilih pertanyaan sebagai panduan menulis:</p>
          <div className="flex flex-wrap gap-2">
            {guidedPrompts.map(p => (
              <button key={p.id} onClick={() => setSelectedPrompt(p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  selectedPrompt?.id === p.id
                    ? 'bg-[#7a3dff] text-white border-[#7a3dff]'
                    : 'bg-white text-[#363636] border-[#d8d8d8] hover:border-[#7a3dff]'
                }`}>
                {p.emoji || ''} {p.text.slice(0, 30)}...
              </button>
            ))}
          </div>
          {selectedPrompt && (
            <div className="mt-3 p-3 bg-[#f5f0ff] rounded border border-[#7a3dff]/20 text-sm text-[#363636]">
              💭 {selectedPrompt.text}
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      {!analysisDone && <JournalCanvas ref={canvasRef} onStrokeChange={setStrokes} onEraseCountChange={setEraseCount} />}

      {/* Timer & Actions */}
      {!analysisDone && (
        <div className="flex items-center justify-between mt-4 p-4 bg-white border border-[#d8d8d8] rounded-[8px]">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#898989]">Durasi: <strong className="text-[#080808]">{durationSeconds}s</strong></span>
            <span className="text-xs font-mono text-[#898989]">Strokes: <strong className="text-[#080808]">{strokes.length}</strong></span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setIsDetoxActive(true); setDetoxTimer(120) }}
              className="text-[11px] font-medium text-[#ff6b00] border border-[#ff6b00] hover:bg-[#fffbf9] uppercase px-2.5 py-1.5 rounded-[4px] transition-all cursor-pointer">
              Detox
            </button>
            <button onClick={handleReset}
              className="bg-white hover:bg-[#fafafa] text-[#080808] border border-[#d8d8d8] text-xs py-1.5 px-3 rounded-[4px] cursor-pointer">
              Reset
            </button>
            <button onClick={handleSubmit} disabled={loading || strokes.length === 0}
              className="bg-[#080808] hover:bg-[#222222] text-white text-xs py-1.5 px-4 rounded-[4px] cursor-pointer disabled:opacity-50">
              {loading ? stage.emoji + ' ' + stage.label.split(':')[0] : 'Kirim & Analisis'}
            </button>
          </div>
        </div>
      )}

      {/* Multi-stage Progress */}
      {loading && (
        <div className="mt-6 p-6 bg-white border border-[#7a3dff]/30 rounded-[8px] space-y-4">
          <span className="text-[11px] font-semibold tracking-[0.1em] text-[#7a3dff] uppercase block">AI Pipeline</span>
          <div className="space-y-3">
            {analysisStages.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 transition-all duration-300 ${
                i <= analysisStage ? 'opacity-100' : 'opacity-30'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  i < analysisStage ? 'bg-[#00d722] text-white' :
                  i === analysisStage ? 'bg-[#7a3dff] text-white animate-pulse' :
                  'bg-[#d8d8d8] text-[#898989]'
                }`}>
                  {i < analysisStage ? '✓' : s.emoji}
                </div>
                <span className={`text-xs font-medium ${
                  i <= analysisStage ? 'text-[#080808]' : 'text-[#898989]'
                }`}>{s.label}</span>
                {i === analysisStage && i < analysisStages.length - 1 && (
                  <span className="text-[10px] text-[#7a3dff] font-mono animate-pulse">Memproses...</span>
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-[#f0f0f0] rounded-full h-1.5 mt-2">
            <div className="bg-[#7a3dff] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((analysisStage + 1) / analysisStages.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Post-analysis Summary */}
      {analysisDone && lastResult && (
        <div className="mt-6 space-y-4">
          <div className="p-6 bg-[#f5f0ff] border border-[#7a3dff]/20 rounded-[8px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#7a3dff] uppercase">Analisis Selesai ✓</span>
              <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-[#d8d8d8]">
                Mood kamu: <strong>{moodBefore}/10</strong> | AI: <strong className="text-[#7a3dff]">{lastResult.sentiment_label}</strong>
              </span>
            </div>

            <div className="p-4 bg-white rounded border border-[#d8d8d8]">
              <p className="text-sm text-[#363636] leading-relaxed">
                <strong className="text-[#080808]">OCR:</strong> "{lastResult.ocr_text}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#d8d8d8] p-3 rounded text-center">
                <span className="text-[10px] text-[#898989] block">Stress Score</span>
                <strong className="text-xl text-[#ff6b00]">{lastResult.stress_score || 0}</strong>
              </div>
              <div className="bg-white border border-[#d8d8d8] p-3 rounded text-center">
                <span className="text-[10px] text-[#898989] block">Mood Score</span>
                <strong className="text-xl text-[#3b89ff]">{lastResult.mood_score || 0}</strong>
              </div>
            </div>

            <div className="bg-white border-l-2 border-[#3b89ff] p-3 rounded-r text-xs">
              <strong className="text-[#3b89ff] block mb-1">Rekomendasi:</strong>
              <p className="text-[#363636]">{lastResult.recommendations}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleGoToInsight}
                className="flex-1 bg-[#7a3dff] hover:bg-[#6a2ee0] text-white text-sm font-medium py-2.5 rounded-[4px] cursor-pointer">
                Lihat Insight Lengkap →
              </button>
              <button onClick={handleReset}
                className="flex-1 bg-white hover:bg-[#fafafa] text-[#080808] border border-[#d8d8d8] text-sm font-medium py-2.5 rounded-[4px] cursor-pointer">
                Tulis Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && !loading && (
        <div className="mt-4 bg-[#fffbf9] border-l-4 border-[#ffae13] text-[#080808] p-3 rounded-[4px] text-xs">
          {errorMsg} <button onClick={() => setErrorMsg('')} className="ml-2 underline cursor-pointer">Tutup</button>
        </div>
      )}

      {/* Digital Detox Overlay */}
      {isDetoxActive && (
        <div className="fixed inset-0 z-50 bg-[#080808]/95 flex items-center justify-center p-8 text-white">
          <div className="max-w-xl w-full text-center space-y-6">
            <span className="text-xs font-mono tracking-widest text-[#ff6b00] uppercase">Digital Detox Mode</span>
            <h2 className="text-3xl font-semibold text-white">Jomblo Mode</h2>
            <p className="text-sm text-[#ababab]">Semua distraksi ditutup. Fokus menulis.</p>
            <div className="text-4xl font-mono font-semibold text-[#ff6b00]">
              {Math.floor(detoxTimer / 60)}:{String(detoxTimer % 60).padStart(2, '0')}
            </div>
            <div className="border border-[#7a3dff] rounded-[8px] overflow-hidden bg-white p-4 h-[280px]">
              <JournalCanvas ref={canvasRef} onStrokeChange={setStrokes} onEraseCountChange={setEraseCount} />
            </div>
            <button onClick={() => setIsDetoxActive(false)}
              className="bg-white text-[#080808] font-medium text-sm py-2 px-6 rounded-[4px] cursor-pointer">Selesai</button>
          </div>
        </div>
      )}
    </div>
  )
}
