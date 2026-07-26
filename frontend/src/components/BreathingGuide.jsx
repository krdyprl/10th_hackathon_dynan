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
  const [isPlaying, setIsPlaying] = useState(true)
  const [cameraOn, setCameraOn] = useState(false)
  const [detectedPhase, setDetectedPhase] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const startRef = useRef(Date.now())
  const rafRef = useRef(null)
  const detectIntervalRef = useRef(null)

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    startRef.current = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startRef.current

      if (elapsed >= CYCLE_DURATION) {
        if (cycle >= TOTAL_CYCLES) {
          setIsPlaying(false)
          return
        }
        setCycle(c => c + 1)
        setPhaseIndex(0)
        setProgress(0)
        startRef.current = Date.now()
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      const phaseElapsed = elapsed % CYCLE_DURATION
      const currentPhase = Math.floor(phaseElapsed / PHASE_DURATION)
      const phaseProgress = (phaseElapsed % PHASE_DURATION) / PHASE_DURATION
      const pct = ((cycle - 1) * CYCLE_DURATION + elapsed) / (TOTAL_CYCLES * CYCLE_DURATION) * 100

      const scale = currentPhase === 0 ? 0.6 + phaseProgress * 0.8 :
                    currentPhase === 1 ? 1.4 :
                    currentPhase === 2 ? 1.4 - phaseProgress * 0.8 :
                    0.6

      setPhaseIndex(currentPhase)
      setProgress(pct)

      document.getElementById('breath-circle')?.style.setProperty('transform', `scale(${scale})`)

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, cycle])

  const toggleCamera = async () => {
    if (cameraOn) {
      stopCamera()
    } else {
      await startCamera()
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraOn(true)
      startDetection()
    } catch {
      setCameraOn(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    clearInterval(detectIntervalRef.current)
    setCameraOn(false)
    setDetectedPhase('')
  }

  const startDetection = () => {
    let lastBrightness = null
    detectIntervalRef.current = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const ctx = canvas.getContext('2d')
      canvas.width = 64
      canvas.height = 48
      ctx.drawImage(video, 0, 0, 64, 48)

      const imageData = ctx.getImageData(0, 0, 64, 48)
      const pixels = imageData.data
      let total = 0
      for (let i = 0; i < pixels.length; i += 4) {
        total += pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114
      }
      const avgBrightness = total / (pixels.length / 4)

      if (lastBrightness !== null) {
        const diff = avgBrightness - lastBrightness
        if (diff > 3) setDetectedPhase('Mengembang... ↑')
        else if (diff < -3) setDetectedPhase('Mengempis... ↓')
        else setDetectedPhase('Diam')
      }
      lastBrightness = avgBrightness
    }, 400)
  }

  const handleReset = () => {
    setPhaseIndex(0)
    setCycle(1)
    setProgress(0)
    setIsPlaying(true)
    startRef.current = Date.now()
  }

  useEffect(() => {
    return () => {
      stopCamera()
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const phase = phases[phaseIndex]

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col items-center justify-center p-4 animate-fadeIn">
      <button onClick={() => { stopCamera(); onClose() }}
        className="absolute top-4 right-4 z-10 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
        <X className="w-6 h-6" />
      </button>

      <div className="text-center space-y-6 max-w-sm w-full">
        <Wind className="w-8 h-8 mx-auto" style={{ color: 'var(--color-pilar-stres)' }} />
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Panduan Pernapasan</h2>

        {/* Camera Toggle */}
        <button onClick={toggleCamera}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border cursor-pointer mx-auto"
          style={{ borderColor: 'var(--color-border)', color: cameraOn ? 'var(--color-pilar-bantuan)' : 'var(--color-text-muted)' }}>
          {cameraOn ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
          {cameraOn ? 'Kamera Aktif' : 'Aktifkan Kamera'}
        </button>

        {/* Camera Preview + Circle */}
        <div className="relative flex items-center justify-center h-56">
          {cameraOn && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20">
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover scale-x-[-1]" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          <div
            id="breath-circle"
            className="w-40 h-40 rounded-full flex items-center justify-center transition-none"
            style={{
              transform: 'scale(0.6)',
              backgroundColor: 'var(--color-pilar-stres-soft)',
              border: '3px solid var(--color-pilar-stres)',
              zIndex: 1,
            }}
          >
            <div className="text-center">
              <div className="text-3xl" style={{ color: 'var(--color-pilar-stres)' }}>
                {phase?.action === 'Tarik' ? '👃' : phase?.action === 'Buang' ? '👄' : '💜'}
              </div>
            </div>
          </div>
        </div>

        {/* Detected */}
        {cameraOn && detectedPhase && (
          <div className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            Deteksi: {detectedPhase}
          </div>
        )}

        {/* Phase Label */}
        <div className="space-y-1">
          <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>{phase?.label}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Siklus {cycle} dari {TOTAL_CYCLES}
          </p>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="h-full rounded-full transition-all duration-200 ease-linear"
            style={{ width: `${progress}%`, backgroundColor: 'var(--color-pilar-stres)' }} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={handleReset}
            className="w-11 h-11 rounded-full border flex items-center justify-center cursor-pointer hover:bg-[var(--color-surface)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90"
            style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={() => { stopCamera(); onClose() }}
            className="text-xs font-medium px-4 py-2 rounded-xl border cursor-pointer hover:bg-[var(--color-surface)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
