import React from 'react'
import { BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const stepMeta = [
  { number: 1, label: 'Check-in', icon: '😊' },
  { number: 2, label: 'Tulis', icon: '✏️' },
  { number: 3, label: 'Analisis', icon: '🧠' },
  { number: 4, label: 'Insight', icon: '💡' },
]

export default function WizardLayout({ currentStep, children, onPrev, onNext, canNext, isLastStep }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-deep via-bg-mid to-bg-surface">
      {/* Decorative orbs */}
      <div className="fixed top-[-100px] right-[-80px] w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-80px] w-60 h-60 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-bg-deep/60 backdrop-blur-sm border-r border-accent-border py-8 px-4 z-40">
        <div className="flex items-center gap-2 px-3 mb-10">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="text-text-primary font-bold text-sm tracking-wide">InkTrace AI</span>
        </div>
        <nav className="space-y-1">
          {stepMeta.map((s, i) => {
            const isActive = currentStep === i
            const isPast = currentStep > i
            return (
              <button
                key={s.number}
                disabled={!isPast && !isActive}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  isActive ? 'bg-accent/20 text-text-primary font-medium' :
                  isPast ? 'text-text-secondary hover:bg-bg-card' :
                  'text-text-muted opacity-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isPast ? 'bg-success/20 text-success' :
                  isActive ? 'bg-accent text-white' :
                  'bg-bg-surface text-text-muted'
                }`}>
                  {isPast ? '✓' : s.icon}
                </span>
                <span>{s.label}</span>
              </button>
            )
          })}
        </nav>
        <button
          onClick={() => navigate('/riwayat')}
          className="mt-auto flex items-center gap-2 px-3 py-2.5 text-sm text-text-muted hover:text-text-secondary hover:bg-bg-card rounded-xl cursor-pointer"
        >
          <BarChart3 className="w-4 h-4" />
          Riwayat
        </button>
      </aside>

      {/* Main content */}
      <div className="md:ml-56 min-h-screen flex flex-col">
        {/* Progress bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-bg-deep/80 backdrop-blur-sm border-b border-accent-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-text-primary text-sm font-bold">InkTrace</span>
          </div>
          <div className="flex items-center gap-1.5">
            {stepMeta.map((s, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                i < currentStep ? 'bg-accent' :
                i === currentStep ? 'bg-accent w-4' :
                'bg-bg-surface'
              }`} />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto py-6 md:py-10">
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {children}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 border-t border-accent-border bg-bg-deep/60 backdrop-blur-sm">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary px-4 py-2 rounded-xl disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            Kembali
          </button>

          <span className="text-xs text-text-muted font-mono">
            {currentStep + 1} / {stepMeta.length}
          </span>

          {isLastStep ? (
            <button
              onClick={() => navigate('/riwayat')}
              className="flex items-center gap-1.5 text-sm bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" /> Lihat Riwayat
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canNext}
              className="flex items-center gap-1.5 text-sm bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              Lanjut
            </button>
          )}
        </div>

        {/* Mobile: Floating Riwayat button */}
        <button
          onClick={() => navigate('/riwayat')}
          className="md:hidden fixed bottom-20 right-4 w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center z-40 cursor-pointer hover:bg-accent-hover"
        >
          <BarChart3 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
