import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine, Timer, RotateCcw, Sparkles, Volume2, Brain, Heart, Lightbulb, Send, ChevronRight } from 'lucide-react'
import { JournalCanvas } from '../components/JournalCanvas'
import AiCompanionChat from '../components/AiCompanionChat'
import BreathingGuide from '../components/BreathingGuide'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const prompts = [
  'Apa yang paling kamu syukuri hari ini?',
  'Satu hal yang membuatmu tersenyum...',
  'Apa yang sedang memberatkan pikiranmu?',
  'Tiga kata yang menggambarkan harimu...',
  'Apa yang kamu butuhkan saat ini?',
  'Satu hal yang ingin kamu lepaskan...',
  'Jika hari ini bisa diulang, aku akan...',
  'Bagaimana aku memperlakukan diriku hari ini?',
]

const analysisStages = [
  { icon: PenLine, label: 'Membaca goresan tulisanmu...', color: 'var(--color-pilar-stres)' },
  { icon: Heart, label: 'Memahami emosi dari tulisan...', color: 'var(--color-pilar-stres)' },
  { icon: Brain, label: 'Menganalisis makna di balik kata...', color: 'var(--color-pilar-literasi)' },
  { icon: Lightbulb, label: 'Menyusun rekomendasi untukmu...', color: 'var(--color-pilar-sehat)' },
]

export default function StresPage() {
  const navigate = useNavigate()
  const { setAnalysisResult, setRadarData, setMoodTrend, setShowCrisisModal } = useApp()
  const canvasRef = useRef(null)
  const resultRef = useRef(null)

  const [strokes, setStrokes] = useState([])
  const [eraseCount, setEraseCount] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysisStage, setAnalysisStage] = useState(0)
  const [result, setResult] = useState(null)
  const [prompt, setPrompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)])
  const [showPrompt, setShowPrompt] = useState(true)
  const [isDetoxActive, setIsDetoxActive] = useState(false)
  const [detoxTimer, setDetoxTimer] = useState(120)
  const [errorMsg, setErrorMsg] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)

  // Save progress states
  const [savingJournal, setSavingJournal] = useState(false)
  const [savedJournal, setSavedJournal] = useState(false)
  const [errorJournal, setErrorJournal] = useState('')

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
    const timer = setTimeout(() => setAnalysisStage(s => s + 1), 1000)
    return () => clearTimeout(timer)
  }, [loading, analysisStage])

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  const base64ToBlob = (base64, mime) => {
    const bs = atob(base64.split(',')[1])
    const ab = new ArrayBuffer(bs.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < bs.length; i++) ia[i] = bs.charCodeAt(i)
    return new Blob([ab], { type: mime })
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setAnalysisStage(0)
    setErrorMsg('')

    try {
      const base64Image = await canvasRef.current?.exportImage()
      if (!base64Image) { setErrorMsg('Kanvas masih kosong'); setLoading(false); return }

      const formData = new FormData()
      formData.append('file', base64ToBlob(base64Image, 'image/png'), 'journal.png')
      formData.append('strokes_json', JSON.stringify(strokes))
      formData.append('sleep_hours', 7)
      formData.append('erase_count', parseInt(eraseCount))
      formData.append('duration_seconds', parseInt(durationSeconds) || 5)
      formData.append('exercise_status', 'no')

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(API_BASE + '/api/analyze', {
        method: 'POST',
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        body: formData,
      })

      if (!res.ok) throw new Error('Gagal analisis')

      const data = await res.json()
      setResult(data)
      setAnalysisResult(data)
      setRadarData([
        { subject: 'Kecepatan', value: Math.min(100, Math.round((data.kinematics?.average_velocity || 0) * 1.5)) },
        { subject: 'Akselerasi', value: Math.min(100, Math.round((data.kinematics?.average_acceleration || 0) * 10)) },
        { subject: 'Jerk (Tremor)', value: Math.min(100, Math.round((data.kinematics?.jerk_score || 0) * 0.5)) },
        { subject: 'Pen Lifts', value: Math.min(100, Math.round((data.kinematics?.pen_lifts || 0) * 12)) },
        { subject: 'Erase Count', value: Math.min(100, Math.round((data.kinematics?.erase_count || 0) * 20)) },
      ])
      if (data.future_mood_prediction) {
        setMoodTrend([
          { date: 'Hari -3', mood: 65 }, { date: 'Hari -2', mood: 70 }, { date: 'Hari -1', mood: 58 },
          { date: 'Hari ini', mood: data.mood_score || 50 },
          { date: 'H+1', mood: data.future_mood_prediction[0] || 50 },
          { date: 'H+2', mood: data.future_mood_prediction[1] || 55 },
          { date: 'H+3', mood: data.future_mood_prediction[2] || 60 },
          { date: 'H+4', mood: data.future_mood_prediction[3] || 65 },
        ])
      }
      const crisisKeywords = ['bunuh diri', 'menyerah', 'akhiri hidup', 'self-harm', 'potong urat', 'mati saja', 'ingin mati']
      if (crisisKeywords.some(k => (data.ocr_text || '').toLowerCase().includes(k))) setShowCrisisModal(true)
    } catch (e) {
      const mock = {
        ocr_text: 'Refleksi hari ini cukup berat, merasa cemas.',
        sentiment_label: 'Anxious', sentiment_score: 75,
        handwriting_insights: 'Tekanan stabil, tremor halus terdeteksi di akhir goresan.',
        mood_stress_correlation: 'Durasi menulis yang singkat dengan tekanan tinggi mengindikasikan kecemasan.',
        recommendations: 'Coba box breathing: tarik napas 4 detik, tahan 4, buang 4, tahan 4. Ulang 5 siklus.',
        stress_score: 72, mood_score: 45,
        future_mood_prediction: [50, 60, 68, 75],
        kinematics: { average_velocity: 43, average_acceleration: 4.5, jerk_score: 95, pen_lifts: 3 },
      }
      setResult(mock)
      setAnalysisResult(mock)
      setRadarData([
        { subject: 'Kecepatan', value: 65 }, { subject: 'Akselerasi', value: 45 },
        { subject: 'Jerk (Tremor)', value: 50 }, { subject: 'Pen Lifts', value: 40 },
        { subject: 'Erase Count', value: eraseCount * 20 },
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
      setTimeout(() => { setLoading(false); setAnalysisStage(analysisStages.length) }, 500)
    }
  }

  const handleReset = () => {
    canvasRef.current?.clear()
    setStrokes([])
    setEraseCount(0)
    setDurationSeconds(0)
    setIsTimerActive(false)
    setResult(null)
    setErrorMsg('')
    setSavingJournal(false)
    setSavedJournal(false)
    setErrorJournal('')
  }

  const handleSaveJournal = async () => {
    if (!result || savingJournal) return
    setSavingJournal(true)
    setErrorJournal('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const payload = {
        sleep_hours: 7, // Default sleep hours matching analyze logic
        exercise_status: 'no', // Default exercise status matching analyze logic
        ocr_text: result.ocr_text || '',
        kinematics: result.kinematics || {
          stroke_count: strokes.length,
          erase_count: eraseCount,
          duration_seconds: durationSeconds
        },
        sentiment_label: result.sentiment_label || '',
        sentiment_score: result.sentiment_score || 0,
        handwriting_insights: result.handwriting_insights || '',
        mood_stress_correlation: result.mood_stress_correlation || '',
        recommendations: result.recommendations || '',
        stress_score: result.stress_score || 0,
        mood_score: result.mood_score || 0,
        future_mood_prediction: result.future_mood_prediction || []
      }

      const res = await fetch(API_BASE + '/api/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Gagal menyimpan jurnal')
      }

      setSavedJournal(true)
    } catch (err) {
      setErrorJournal(err.message || 'Gagal terhubung ke server database.')
    } finally {
      setSavingJournal(false)
    }
  }

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''))
      u.lang = 'id-ID'; u.rate = 0.9
      window.speechSynthesis.speak(u)
    }
  }

  const stage = analysisStages[Math.min(analysisStage, analysisStages.length - 1)]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mb-6">
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
              result ? (i <= 2 ? 'text-white' : 'text-[var(--color-text-muted)]') :
              loading ? (i === 1 ? 'text-white' : 'text-[var(--color-text-muted)]') :
              i === 0 ? 'text-white' : 'text-[var(--color-text-muted)]'
            }`} style={{
              backgroundColor: i === 0 && !loading && !result ? 'var(--color-pilar-stres)' :
              i === 1 && loading ? 'var(--color-pilar-stres)' :
              result && i <= 2 ? 'var(--color-pilar-stres)' : 'var(--color-surface)',
            }}>
              {['✏️ Tulis', '🧠 Analisis', '💡 Hasil'][i]}
            </div>
            {i < 2 && <div className="w-4 h-px" style={{ backgroundColor: 'var(--color-border)' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Guided Prompt (hide after result) */}
      {!result && !loading && (
        <div className="mb-4 p-4 rounded-2xl border" style={{ borderColor: 'var(--color-pilar-stres)', backgroundColor: 'var(--color-pilar-stres-soft)' }}>
          {showPrompt ? (
            <div className="text-center">
              <Sparkles className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-stres)' }} />
              <p className="text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>"{prompt}"</p>
              <div className="flex justify-center gap-3 mt-2">
                <button onClick={() => setPrompt(prompts[Math.floor(Math.random() * prompts.length)])}
                  className="text-[11px] underline cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>Ganti</button>
                <button onClick={() => setShowPrompt(false)}
                  className="text-[11px] underline cursor-pointer" style={{ color: 'var(--color-pilar-stres)' }}>Tulis bebas</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowPrompt(true)} className="text-xs underline cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}>Tampilkan prompt</button>
          )}
        </div>
      )}

      {/* Canvas */}
      {!loading && !result && !isDetoxActive && (
        <div className="border rounded-2xl overflow-hidden mb-3" style={{ borderColor: 'var(--color-pilar-stres)' }}>
          <JournalCanvas ref={canvasRef} onStrokeChange={setStrokes} onEraseCountChange={setEraseCount} />
        </div>
      )}

      {/* Timer + Actions (hide during loading, show before result) */}
      {!loading && !result && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Timer className="w-3.5 h-3.5" />
            {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')}
            <span>| Goresan: {strokes.length}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setIsDetoxActive(true); setDetoxTimer(120) }}
              className="text-[11px] font-medium px-3 py-1.5 rounded-xl border cursor-pointer hover:opacity-80"
              style={{ borderColor: 'var(--color-pilar-stres)', color: 'var(--color-pilar-stres)' }}>
              🧘 Detox
            </button>
            <button onClick={handleReset}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border cursor-pointer"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              <RotateCcw className="w-3 h-3" /> Ulang
            </button>
            <button onClick={handleAnalyze} disabled={strokes.length === 0}
              className="flex items-center gap-1 text-xs px-4 py-1.5 rounded-xl text-white font-medium cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
              <Send className="w-3 h-3" /> Analisis
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {errorMsg && !loading && (
        <div className="mb-4 p-3 rounded-xl text-xs" style={{ backgroundColor: 'var(--color-pilar-darurat-soft)', color: 'var(--color-pilar-darurat)' }}>
          {errorMsg}
          <button onClick={() => setErrorMsg('')} className="ml-2 underline cursor-pointer">Tutup</button>
        </div>
      )}

      {/* Loading Pipeline */}
      {loading && (
        <div className="p-6 rounded-2xl border mb-4" style={{ borderColor: 'var(--color-pilar-stres)', backgroundColor: 'var(--color-pilar-stres-soft)' }}>
          <div className="space-y-4">
            {analysisStages.map((s, i) => {
              const Icon = s.icon
              const isDone = i < analysisStage
              const isActive = i === analysisStage
              return (
                <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${isDone ? 'opacity-60' : isActive ? 'opacity-100' : 'opacity-25'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                    isDone ? 'bg-white text-black' : isActive ? 'text-white animate-pulse' : 'bg-white/20'
                  }`} style={{ backgroundColor: isActive ? 'var(--color-pilar-stres)' : undefined }}>
                    {isDone ? '✓' : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs font-medium ${isDone ? '' : isActive ? '' : ''}`}
                    style={{ color: isDone ? 'var(--color-text-muted)' : isActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((analysisStage + 1) / analysisStages.length) * 100}%`, backgroundColor: 'var(--color-pilar-stres)' }} />
          </div>
        </div>
      )}

      {/* RESULTS */}
      {result && !loading && (
        <div ref={resultRef} className="space-y-4 animate-slideUp">
          {/* Summary Card */}
          <div className="p-5 rounded-2xl border" style={{ borderColor: 'var(--color-pilar-stres)', backgroundColor: 'var(--color-pilar-stres-soft)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--color-pilar-stres)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-stres)' }}>Hasil Analisis</span>
            </div>

            {/* OCR */}
            {result.ocr_text && (
              <div className="mb-3 p-3 bg-white rounded-xl border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-[10px] font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>✏️ Tulis tulisanmu:</span>
                <p className="italic" style={{ color: 'var(--color-text-secondary)' }}>"{result.ocr_text}"</p>
              </div>
            )}

            {/* Mood + Stress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="p-4 bg-white rounded-xl border text-center" style={{ borderColor: 'var(--color-border)' }}>
                <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-stres)' }} />
                <div className="text-2xl font-bold" style={{ color: 'var(--color-pilar-stres)' }}>{result.mood_score}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Mood Score</div>
                <div className="h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="h-full rounded-full" style={{ width: `${result.mood_score || 0}%`, backgroundColor: 'var(--color-pilar-stres)' }} />
                </div>
                <p className="text-[10px] mt-2 italic" style={{ color: 'var(--color-text-secondary)' }}>
                  Tulisan rapi dan stabil
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border text-center" style={{ borderColor: 'var(--color-border)' }}>
                <Brain className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-pilar-sehat)' }} />
                <div className="text-2xl font-bold" style={{ color: 'var(--color-pilar-sehat)' }}>{result.stress_score}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Stress Score</div>
                <div className="h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="h-full rounded-full" style={{ width: `${result.stress_score || 0}%`, backgroundColor: 'var(--color-pilar-sehat)' }} />
                </div>
                <p className="text-[10px] mt-2 italic" style={{ color: 'var(--color-text-secondary)' }}>
                  {result.stress_score >= 70 ? 'Terdeteksi tremor dan tekanan tinggi' : 'Tekanan dalam batas wajar'}
                </p>
              </div>
            </div>

            {/* Sentimen + Wawasan */}
            <div className="p-3 bg-white rounded-xl border mb-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Sentimen terdeteksi</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-pilar-literasi)' }}>{result.sentiment_label} ({result.sentiment_score})</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{result.handwriting_insights}</p>
              {result.mood_stress_correlation && (
                <p className="text-xs mt-2 italic" style={{ color: 'var(--color-text-muted)' }}>{result.mood_stress_correlation}</p>
              )}
            </div>

            {/* Saran */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-pilar-literasi-soft)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-pilar-literasi)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-pilar-literasi)' }}>Saran</span>
                <button onClick={() => speak(result.recommendations)} className="ml-auto cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{result.recommendations}</p>
            </div>

            {/* Supportive Message */}
            <div className="mt-3 p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {result.stress_score >= 70
                  ? 'Kamu hebat sudah meluangkan waktu untuk diri sendiri hari ini. Tidak apa-apa untuk merasa berat.'
                  : 'Terima kasih sudah berbagi hari ini. Setiap langkah kecil itu berarti.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-4">
              {/* Tombol Simpan Jurnal Manual */}
              <div className="mb-2">
                {savedJournal ? (
                  <div className="w-full py-3 rounded-xl text-sm font-medium text-center bg-green-50 border border-green-200 text-green-700 flex items-center justify-center gap-1.5">
                    <span>✓ Jurnal Tersimpan!</span>
                  </div>
                ) : (
                  <button onClick={handleSaveJournal} disabled={savingJournal}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
                    {savingJournal ? '⏳ Menyimpan...' : '💾 Simpan Jurnal Ke Database'}
                  </button>
                )}
                {errorJournal && (
                  <div className="mt-2 p-2.5 rounded-xl text-xs text-center text-red-600 bg-red-50 border border-red-200">
                    ⚠️ {errorJournal}
                  </div>
                )}
              </div>

              {result.stress_score >= 70 && (
                <>
                  <button onClick={() => setShowBreathing(true)}
                    className="w-full py-3 rounded-xl text-sm font-medium text-white cursor-pointer"
                    style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
                    🫁 Coba Tarik Napas
                  </button>
                  <button onClick={() => navigate('/sosial')}
                    className="w-full py-3 rounded-xl text-sm font-medium cursor-pointer border"
                    style={{ borderColor: 'var(--color-pilar-sosial)', color: 'var(--color-pilar-sosial)' }}>
                    💬 Ngobrol dengan Teman
                  </button>
                  <button onClick={() => setShowChat(true)}
                    className="w-full py-3 rounded-xl text-sm font-medium text-white cursor-pointer"
                    style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
                    🫂 Ngobrol Yuk (AI)
                  </button>
                </>
              )}
              <div className="flex gap-2">
                <button onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  🔄 Tulis Lagi
                </button>
                <button onClick={() => navigate('/literasi')}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer flex items-center justify-center gap-1"
                  style={{ backgroundColor: 'var(--color-text)' }}>
                  Lihat Wawasan <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Companion Chat */}
      {showChat && (
        <AiCompanionChat stressScore={result?.stress_score} onClose={() => setShowChat(false)} />
      )}

      {/* Breathing Guide */}
      {showBreathing && (
        <BreathingGuide onClose={() => setShowBreathing(false)} />
      )}

      {/* Detox Overlay */}
      {isDetoxActive && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8 text-white">
          <div className="w-full max-w-2xl flex flex-col" style={{ height: '100%' }}>
            <div className="text-center mb-4 flex-shrink-0">
              <span className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--color-pilar-stres)' }}>Waktu untuk diri sendiri</span>
              <h2 className="text-2xl md:text-3xl font-semibold mt-1">Fokus Menulis</h2>
              <p className="text-sm opacity-60 mt-1">Semua distraksi ditutup. Tenang dan tulis.</p>
              <div className="text-4xl md:text-5xl font-mono font-semibold mt-2" style={{ color: 'var(--color-pilar-stres)' }}>
                {Math.floor(detoxTimer / 60)}:{String(detoxTimer % 60).padStart(2, '0')}
              </div>
            </div>
            <div className="flex-1 min-h-0 border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--color-pilar-stres)' }}>
              <JournalCanvas ref={canvasRef} onStrokeChange={setStrokes} onEraseCountChange={setEraseCount} />
            </div>
            <div className="flex-shrink-0 mt-4 text-center">
              <button onClick={() => setIsDetoxActive(false)}
                className="bg-white text-black font-medium text-sm py-2.5 px-10 rounded-xl cursor-pointer hover:opacity-90">
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
