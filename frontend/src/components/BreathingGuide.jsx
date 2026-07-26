import React, { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, RotateCcw, Wind } from 'lucide-react'

const phases = [
  { label: 'Tarik napas...', action: 'Tarik', duration: 4000, scale: 1.4 },
  { label: 'Tahan...', action: 'Tahan', duration: 4000, scale: 1.4 },
  { label: 'Buang napas...', action: 'Buang', duration: 4000, scale: 0.6 },
  { label: 'Tahan...', action: 'Tahan', duration: 4000, scale: 0.6 },
]

const TOTAL_CYCLES = 3
const PHASE_DURATION = 4000
const CYCLE_DURATION = PHASE_DURATION * phases.length

export default function BreathingGuide({ onClose }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycle, setCycle] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const startRef = useRef(Date.now())
  const rafRef = useRef(null)

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    startRef.current = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startRef.current
      const totalElapsed = ((cycle - 1) * CYCLE_DURATION) + elapsed

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

      setPhaseIndex(currentPhase)
      setProgress(((cycle - 1) * CYCLE_DURATION + elapsed) / (TOTAL_CYCLES * CYCLE_DURATION) * 100)

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, cycle])

  const handleReset = () => {
    setPhaseIndex(0)
    setCycle(1)
    setProgress(0)
    setIsPlaying(true)
    startRef.current = Date.now()
  }

  const phase = phases[phaseIndex]

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 animate-fadeIn">
      <button onClick={onClose} className="absolute top-6 right-6 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
        <X className="w-6 h-6" />
      </button>

      <div className="text-center space-y-8 max-w-sm w-full">
        <Wind className="w-10 h-10 mx-auto" style={{ color: 'var(--color-pilar-stres)' }} />
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Panduan Pernapasan</h2>

        {/* Breathing Circle */}
        <div className="flex items-center justify-center h-64">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center transition-transform duration-[4000ms] ease-in-out"
            style={{
              transform: `scale(${phase?.scale || 0.6})`,
              backgroundColor: 'var(--color-pilar-stres-soft)',
              border: '3px solid var(--color-pilar-stres)',
            }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--color-pilar-stres)' }}>
                {phase?.action === 'Tarik' ? '👃' : phase?.action === 'Buang' ? '👄' : '💜'}
              </div>
            </div>
          </div>
        </div>

        {/* Phase Label */}
        <div className="space-y-1">
          <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>{phase?.label}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Siklus {cycle} dari {TOTAL_CYCLES}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div
            className="h-full rounded-full transition-all duration-200 ease-linear"
            style={{ width: `${progress}%`, backgroundColor: 'var(--color-pilar-stres)' }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={handleReset} className="w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer hover:bg-[var(--color-surface)] transition-all"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--color-pilar-stres)' }}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-xl border cursor-pointer hover:bg-[var(--color-surface)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
