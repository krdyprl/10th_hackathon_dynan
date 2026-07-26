import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { AppProvider } from './context/AppContext'
import Auth from './components/Auth'
import AppLayout from './layouts/AppLayout'
import WelcomePage from './pages/WelcomePage'
import StresPage from './pages/StresPage'
import SehatPage from './pages/SehatPage'
import LiterasiPage from './pages/LiterasiPage'
import SosialPage from './pages/SosialPage'
import BantuanPage from './pages/BantuanPage'
import DaruratPage from './pages/DaruratPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoadingSession(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--color-pilar-stres)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!session) return <Auth />

  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/stres" element={<StresPage />} />
            <Route path="/sehat" element={<SehatPage />} />
            <Route path="/literasi" element={<LiterasiPage />} />
            <Route path="/sosial" element={<SosialPage />} />
            <Route path="/bantuan" element={<BantuanPage />} />
            <Route path="/darurat" element={<DaruratPage />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
