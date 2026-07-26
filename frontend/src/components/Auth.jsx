import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, age: parseInt(age) || null } },
        })
        if (error) throw error
        setMessage(data?.user?.identities?.length === 0
          ? 'Akun sudah terdaftar. Silakan login.'
          : 'Registrasi berhasil! Cek email untuk konfirmasi.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
    } catch (err) {
      setMessage(err.message)
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-white text-[var(--color-text)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-pilar-stres)] transition-colors'

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-pilar-stres)' }} />
            <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>InkTrace AI</span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
            {isSignUp ? 'Buat Akun Baru' : 'Masuk ke Akun Anda'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {isSignUp ? 'Daftar untuk mulai merefleksikan diri' : 'Lanjutkan perjalanan refleksi Anda'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <input type="text" placeholder="Nama Lengkap" value={fullName}
                onChange={e => setFullName(e.target.value)} className={inputClass} required />
              <input type="number" placeholder="Umur" value={age}
                onChange={e => setAge(e.target.value)} min="10" max="100" className={inputClass} />
            </>
          )}
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} className={inputClass} required />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} className={inputClass} required minLength={6} />

          <button type="submit" disabled={loading}
            className="w-full text-white font-medium text-sm py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-text)' }}>
            {loading ? 'Memproses...' : isSignUp ? 'Daftar' : 'Masuk'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div className="relative flex justify-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ backgroundColor: 'var(--color-bg)' }} className="px-2">atau</span>
          </div>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading}
          className="w-full bg-white hover:bg-[var(--color-surface)] border text-sm font-medium py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Lanjutkan dengan Google
        </button>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
          {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            className="hover:underline font-medium cursor-pointer"
            style={{ color: 'var(--color-pilar-stres)' }}>
            {isSignUp ? 'Masuk' : 'Daftar'}
          </button>
        </p>

        {message && (
          <div className="mt-4 p-3 rounded-xl text-xs text-center"
            style={{ backgroundColor: 'var(--color-pilar-literasi-soft)', border: '1px solid var(--color-pilar-literasi)', color: 'var(--color-pilar-literasi)' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
