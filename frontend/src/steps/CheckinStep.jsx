import React from 'react'
import { Heart } from 'lucide-react'

const moods = [
  { emoji: '😭', label: 'Sangat berat', value: 1 },
  { emoji: '😔', label: 'Sedih', value: 2 },
  { emoji: '😐', label: 'Biasa aja', value: 3 },
  { emoji: '🙂', label: 'Cukup baik', value: 4 },
  { emoji: '😄', label: 'Sangat baik', value: 5 },
]

export default function CheckinStep({ value, onChange }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-soft border border-accent-border">
          <Heart className="w-7 h-7 text-accent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
          Hai, apa kabar<br />hari ini?
        </h1>
        <p className="text-text-muted text-base">
          Pilih yang paling mendekati perasaanmu
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 w-full max-w-md">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              value === m.value
                ? 'border-accent bg-accent-soft scale-105'
                : 'border-accent-border bg-bg-card hover:bg-bg-card-hover border-opacity-30'
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className={`text-[10px] font-medium text-center leading-tight ${
              value === m.value ? 'text-text-primary' : 'text-text-muted'
            }`}>
              {m.label}
            </span>
          </button>
        ))}
      </div>

      {value && (
        <p className="text-text-secondary text-sm animate-[fadeIn_0.3s_ease-out]">
          {value <= 2 ? 'Tidak apa-apa. Aku di sini.' :
           value === 3 ? 'Biasa juga oke.' :
           'Syukurlah. Senang mendengarnya.'}
        </p>
      )}
    </div>
  )
}
