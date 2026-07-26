import React, { createContext, useContext, useState } from 'react'
import CrisisModal from '../components/CrisisModal'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [analysisResult, setAnalysisResult] = useState(null)
  const [radarData, setRadarData] = useState([
    { subject: 'Kecepatan', value: 0 },
    { subject: 'Akselerasi', value: 0 },
    { subject: 'Jerk (Tremor)', value: 0 },
    { subject: 'Pen Lifts', value: 0 },
    { subject: 'Erase Count', value: 0 },
  ])
  const [moodTrend, setMoodTrend] = useState([
    { date: 'Hari -3', mood: 65 },
    { date: 'Hari -2', mood: 70 },
    { date: 'Hari -1', mood: 58 },
    { date: 'Hari ini', mood: 50 },
    { date: 'Besok', mood: 55 },
    { date: 'Lusa', mood: 62 },
    { date: 'H+3', mood: 70 },
  ])
  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [gpsPermissionAsked, setGpsPermissionAsked] = useState(false)
  const [trustedCircles, setTrustedCircles] = useState([])

  return (
    <AppContext.Provider
      value={{
        analysisResult, setAnalysisResult,
        radarData, setRadarData,
        moodTrend, setMoodTrend,
        showCrisisModal, setShowCrisisModal,
        userLocation, setUserLocation,
        gpsPermissionAsked, setGpsPermissionAsked,
        trustedCircles, setTrustedCircles,
      }}
    >
      {children}
      {showCrisisModal && <CrisisModal onClose={() => setShowCrisisModal(false)} />}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
