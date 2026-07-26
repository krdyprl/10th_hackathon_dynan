import React, { useState } from 'react'

export default function KebiasaanPage() {
  const [sleepHours, setSleepHours] = useState('7.0')
  const [exerciseStatus, setExerciseStatus] = useState('no')
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12 py-8">
      <span className="text-[11px] font-semibold tracking-[0.1em] text-[#ff6b00] uppercase block mb-1">Kebiasaan Sehat</span>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#080808] mb-1">Log Harian</h1>
      <p className="text-sm text-[#5a5a5a] mb-6">{today}</p>

      <div className="border-l-4 border-[#ff6b00] bg-[#fffbf9] rounded-r-[8px] p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#363636] mb-2">
            Jam Tidur Semalam: <strong>{sleepHours} jam</strong>
          </label>
          <input type="range" min="0" max="12" step="0.5" value={sleepHours}
            onChange={e => setSleepHours(e.target.value)}
            className="w-full accent-[#ff6b00]" />
          <div className="flex justify-between text-xs text-[#898989] mt-1 font-mono">
            <span>0</span><span>6</span><span>12 jam</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#363636] mb-2">Olahraga Hari Ini?</label>
          <select value={exerciseStatus} onChange={e => setExerciseStatus(e.target.value)}
            className="w-full bg-white text-[#080808] border border-[#d8d8d8] rounded-[4px] px-3 py-2 text-sm outline-none focus:border-[#ff6b00]">
            <option value="no">Tidak</option>
            <option value="yes">Ya (Minimal 15 menit)</option>
          </select>
        </div>

        <div className="pt-2 border-t border-[#d8d8d8]">
          <span className="text-[11px] font-semibold tracking-[0.1em] text-[#ff6b00] uppercase block mb-2">Streak</span>
          <div className="flex items-center gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                i < 3 ? 'bg-[#ff6b00] text-white' : 'bg-[#f0f0f0] text-[#898989]'
              }`}>
                {['S', 'S', 'R', 'K', 'J', 'S', 'M'][i]}
              </div>
            ))}
            <span className="text-xs text-[#898989] ml-2">3 hari berturut-turut!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
