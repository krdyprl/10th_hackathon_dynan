import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfilPage() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setProfile(data.user)
    })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12 py-8">
      <span className="text-[11px] font-semibold tracking-[0.1em] text-[#5a5a5a] uppercase block mb-1">Akun</span>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#080808] mb-6">Profil Saya</h1>

      <div className="bg-white border border-[#d8d8d8] rounded-[8px] p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-[#d8d8d8]">
          <div className="w-12 h-12 rounded-full bg-[#7a3dff] flex items-center justify-center text-white text-lg font-semibold">
            {profile?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#080808]">{profile?.email || 'Memuat...'}</h4>
            <p className="text-xs text-[#898989]">Terdaftar via Supabase Auth</p>
          </div>
        </div>

        <div className="text-xs text-[#363636] space-y-2">
          <div className="flex justify-between py-1">
            <span className="text-[#898989]">Email</span>
            <span className="font-mono">{profile?.email}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#898989]">UID</span>
            <span className="font-mono text-[10px]">{profile?.id?.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#898989]">Terdaftar sejak</span>
            <span className="font-mono">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID') : '-'}</span>
          </div>
        </div>

        <button onClick={() => supabase.auth.signOut()}
          className="w-full mt-4 bg-[#ee1d36] hover:bg-[#c9182e] text-white text-sm font-medium py-2.5 rounded-[4px] cursor-pointer">
          Keluar
        </button>
      </div>
    </div>
  )
}
