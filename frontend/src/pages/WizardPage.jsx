import React, { useState, useCallback, useRef } from 'react'
import WizardLayout from '../layouts/WizardLayout'
import CheckinStep from '../steps/CheckinStep'
import TulisStep from '../steps/TulisStep'
import AnalisisStep from '../steps/AnalisisStep'
import InsightStep from '../steps/InsightStep'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function WizardPage() {
  const [step, setStep] = useState(0)
  const [mood, setMood] = useState(null)
  const [strokes, setStrokes] = useState([])
  const [eraseCount, setEraseCount] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const { setAnalysisResult, setRadarData, setMoodTrend, setShowCrisisModal } = useApp()

  const handleNext = useCallback(async () => {
    if (step === 1) {
      if (strokes.length === 0) return
      setAnalysisLoading(true)
      setStep(2)

      try {
        const canvasEl = document.querySelector('.sketch-canvas canvas')
        const dataUrl = canvasEl?.toDataURL?.()
        if (dataUrl) {
          const blob = await (await fetch(dataUrl)).blob()
          const formData = new FormData()
          formData.append('file', blob, 'journal.png')
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

          if (res.ok) {
            const result = await res.json()
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
            setTimeout(() => setStep(3), 2800)
            return
          }
        }
      } catch {}

      // Fallback mock
      const mock = {
        ocr_text: 'Refleksi hari ini...', sentiment_label: 'Anxious', sentiment_score: 75,
        handwriting_insights: 'Tekanan stabil, tremor halus.',
        mood_stress_correlation: 'Kurang tidur meningkatkan stres.',
        recommendations: 'Box breathing: 4-4-4-4, 5 siklus.',
        stress_score: 65, mood_score: 45,
        future_mood_prediction: [50, 60, 68, 75],
      }
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
      setTimeout(() => setStep(3), 2800)
      return
    }

    if (step === 2) {
      setAnalysisLoading(false)
    }

    setStep(s => Math.min(s + 1, 3))
  }, [step, strokes, eraseCount, durationSeconds])

  return (
    <WizardLayout
      currentStep={step}
      onPrev={() => setStep(s => Math.max(s - 1, 0))}
      onNext={handleNext}
      canNext={
        step === 0 ? mood !== null :
        step === 1 ? strokes.length > 0 :
        step === 2 ? false :
        false
      }
      isLastStep={step === 3}
    >
      {step === 0 && <CheckinStep value={mood} onChange={setMood} />}
      {step === 1 && (
        <TulisStep
          onComplete={() => setStep(2)}
          strokes={strokes}
          setStrokes={setStrokes}
          eraseCount={eraseCount}
          setEraseCount={setEraseCount}
          durationSeconds={durationSeconds}
          setDurationSeconds={setDurationSeconds}
          isTimerActive={isTimerActive}
          setIsTimerActive={setIsTimerActive}
        />
      )}
      {step === 2 && <AnalisisStep />}
      {step === 3 && <InsightStep />}
    </WizardLayout>
  )
}
