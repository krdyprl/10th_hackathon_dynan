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
          email,
          password,
          options: { data: { full_name: fullName, age: parseInt(age) || null } }
        })
        if (error) throw error
        if (data?.user?.identities?.length === 0) {
          setMessage('Akun sudah terdaftar. Silakan login.')
        } else {
          setMessage('Registrasi berhasil! Cek email untuk konfirmasi.')
        }
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
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
    } catch (err) {
      setMessage(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#7a3dff]"></span>
            <span className="text-lg font-semibold tracking-tight text-[#080808]">InkTrace AI</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#080808]">
            {isSignUp ? 'Buat Akun Baru' : 'Masuk ke Akun Anda'}
          </h1>
          <p className="text-sm text-[#5a5a5a] mt-1">
            {isSignUp
              ? 'Daftar untuk mulai merefleksikan diri'
              : 'Lanjutkan perjalanan refleksi Anda'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white text-[#080808] border border-[#d8d8d8] rounded-[4px] px-4 py-3 text-sm outline-none focus:border-[#7a3dff]"
                required
              />
              <input
                type="number"
                placeholder="Umur"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="10"
                max="100"
                className="w-full bg-white text-[#080808] border border-[#d8d8d8] rounded-[4px] px-4 py-3 text-sm outline-none focus:border-[#7a3dff]"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white text-[#080808] border border-[#d8d8d8] rounded-[4px] px-4 py-3 text-sm outline-none focus:border-[#7a3dff]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white text-[#080808] border border-[#d8d8d8] rounded-[4px] px-4 py-3 text-sm outline-none focus:border-[#7a3dff]"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#080808] hover:bg-[#222222] text-white font-medium text-sm py-3 rounded-[4px] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isSignUp ? 'Daftar' : 'Masuk'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#d8d8d8]"></div>
          </div>
          <div className="relative flex justify-center text-xs text-[#898989]">
            <span className="bg-white px-2">atau</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-[#fafafa] text-[#080808] border border-[#d8d8d8] font-medium text-sm py-3 rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Lanjutkan dengan Google
        </button>

        <p className="text-center text-xs text-[#898989] mt-6">
          {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            className="text-[#7a3dff] hover:underline font-medium cursor-pointer"
          >
            {isSignUp ? 'Masuk' : 'Daftar'}
          </button>
        </p>

        {message && (
          <div className="mt-4 p-3 bg-[#f9fcff] border border-[#3b89ff] text-[#3b89ff] rounded-[4px] text-xs text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
