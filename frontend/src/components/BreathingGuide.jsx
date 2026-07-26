import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Play, Pause, RotateCcw, Wind, Camera, CameraOff } from 'lucide-react'

const phases = [
  { label: 'Tarik napas...', action: 'Tarik', duration: 4000, scale: 1 },
  { label: 'Tahan...', action: 'Tahan', duration: 4000, scale: 1 },
  { label: 'Buang napas...', action: 'Buang', duration: 4000, scale: 1 },
  { label: 'Tahan...', action: 'Tahan', duration: 4000, scale: 1 },
]

const TOTAL_CYCLES = 3
const PHASE_DURATION = 4000
const CYCLE_DURATION = PHASE_DURATION * phases.length

export default function BreathingGuide({ onClose }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycle, setCycle] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [detectedPhase, setDetectedPhase] = useState('—')
  const [score, setScore] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const startRef = useRef(Date.now())
  const rafRef = useRef(null)
  const detectIntervalRef = useRef(null)
  const phaseHitsRef = useRef(0)
  const totalFramesRef = useRef(0)

  useEffect(() => {
    if (!isPlaying) { cancelAnimationFrame(rafRef.current); return }
    startRef.current = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startRef.current
      if (elapsed >= CYCLE_DURATION) {
        if (cycle >= TOTAL_CYCLES) { setIsPlaying(false); calculateScore(); return }
        setCycle(c => c + 1); setPhaseIndex(0); setProgress(0); startRef.current = Date.now()
        rafRef.current = requestAnimationFrame(animate); return
      }
      const phaseElapsed = elapsed % CYCLE_DURATION
      const currentPhase = Math.floor(phaseElapsed / PHASE_DURATION)
      const phaseProgress = (phaseElapsed % PHASE_DURATION) / PHASE_DURATION
      const pct = ((cycle - 1) * CYCLE_DURATION + elapsed) / (TOTAL_CYCLES * CYCLE_DURATION) * 100
      const scale = currentPhase === 0 ? 0.6 + phaseProgress * 0.8 : currentPhase === 1 ? 1.4 : currentPhase === 2 ? 1.4 - phaseProgress * 0.8 : 0.6
      setPhaseIndex(currentPhase); setProgress(pct)
      document.getElementById('breath-circle')?.style.setProperty('transform', `scale(${scale})`)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, cycle])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraOn(true)
      setTimeout(() => setIsPlaying(true), 500)
      startDetection()
    } catch { setCameraOn(false) }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    clearInterval(detectIntervalRef.current)
    setCameraOn(false)
  }

  const startDetection = () => {
    let lastBrightness = null
    detectIntervalRef.current = setInterval(() => {
      const video = videoRef.current, canvas = canvasRef.current
      if (!video || !canvas) return
      const ctx = canvas.getContext('2d')
      canvas.width = 128; canvas.height = 96
      ctx.drawImage(video, 0, 0, 128, 96)
      const imageData = ctx.getImageData(0, 0, 128, 96)
      const pixels = imageData.data
      let total = 0
      for (let i = 0; i < pixels.length; i += 4) total += pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114
      const avgBrightness = total / (pixels.length / 4)
      if (lastBrightness !== null) {
        const diff = avgBrightness - lastBrightness
        const isExpanding = diff > 3; const isContracting = diff < -3
        const expectedExpand = phaseIndex === 0; const expectedContract = phaseIndex === 2
        totalFramesRef.current++
        if ((isExpanding && expectedExpand) || (isContracting && expectedContract)) phaseHitsRef.current++
        setDetectedPhase(isExpanding ? 'Mengembang ↑' : isContracting ? 'Mengempis ↓' : 'Diam')
      }
      lastBrightness = avgBrightness
    }, 300)
  }

  const calculateScore = () => {
    const accuracy = totalFramesRef.current > 0 ? Math.round((phaseHitsRef.current / totalFramesRef.current) * 100) : 0
    setScore(Math.min(100, accuracy))
  }

  useEffect(() => { return () => { stopCamera(); cancelAnimationFrame(rafRef.current) } }, [])

  const handleReset = () => {
    setPhaseIndex(0); setCycle(1); setProgress(0); setScore(null)
    phaseHitsRef.current = 0; totalFramesRef.current = 0
    setIsPlaying(true); startRef.current = Date.now()
  }

  const phase = phases[phaseIndex]

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col items-center justify-center p-4 animate-fadeIn">
      <button onClick={() => { stopCamera(); onClose() }} className="absolute top-4 right-4 z-10 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}><X className="w-6 h-6" /></button>
      <div className="text-center space-y-5 max-w-sm w-full">
        <Wind className="w-8 h-8 mx-auto" style={{ color: 'var(--color-pilar-stres)' }} />
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Panduan Pernapasan</h2>

        {!cameraOn ? (
          <button onClick={startCamera} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
            <Camera className="w-5 h-5" /> Aktifkan Kamera untuk Mulai
          </button>
        ) : (
          <>
            <div className="relative flex items-center justify-center h-56">
              <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-80">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div id="breath-circle" className="w-40 h-40 rounded-full flex items-center justify-center transition-none" style={{ transform: 'scale(0.6)', backgroundColor: 'var(--color-pilar-stres-soft)', border: '3px solid var(--color-pilar-stres)', zIndex: 1 }}>
                <div className="text-center"><div className="text-3xl" style={{ color: 'var(--color-pilar-stres)' }}>{phase?.action === 'Tarik' ? '👃' : phase?.action === 'Buang' ? '👄' : '💜'}</div></div>
              </div>
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>Deteksi: {detectedPhase}</div>
            <div className="space-y-1"><p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>{phase?.label}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Siklus {cycle} dari {TOTAL_CYCLES}</p></div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="h-full rounded-full transition-all duration-200 ease-linear" style={{ width: `${progress}%`, backgroundColor: 'var(--color-pilar-stres)' }} />
            </div>
            {score != null && <div className="text-base font-bold" style={{ color: 'var(--color-pilar-stres)' }}>Skor: {score}% sinkronisasi napas</div>}
            <div className="flex items-center justify-center gap-4">
              <button onClick={handleReset} className="w-11 h-11 rounded-full border flex items-center justify-center cursor-pointer" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}><RotateCcw className="w-4 h-4" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full flex items-center justify-center text-white cursor-pointer" style={{ backgroundColor: 'var(--color-pilar-stres)' }}>{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>
              <button onClick={() => { stopCamera(); onClose() }} className="text-xs font-medium px-4 py-2 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>Tutup</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
