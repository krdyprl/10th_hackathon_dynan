import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Tulis Jurnal', icon: '✏️', desc: 'Kanvas refleksi harian' },
  { to: '/kebiasaan', label: 'Kebiasaan', icon: '🌙', desc: 'Tidur & olahraga' },
  { to: '/literasi', label: 'Literasi', icon: '📊', desc: 'Grafik & insight AI' },
  { to: '/dukungan', label: 'Dukungan', icon: '💬', desc: 'Trusted Circle' },
  { to: '/bantuan', label: 'Bantuan', icon: '📍', desc: 'Klinik terdekat' },
  { to: '/profil', label: 'Profil', icon: '👤', desc: 'Akun & pengaturan' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-[#d8d8d8] z-50">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-[#d8d8d8]">
        <span className="w-3 h-3 rounded-full bg-[#7a3dff]"></span>
        <span className="text-lg font-semibold tracking-tight text-[#080808]">InkTrace AI</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-sm transition-all ${
                isActive
                  ? 'bg-[#f5f0ff] text-[#7a3dff] font-medium'
                  : 'text-[#363636] hover:bg-[#fafafa]'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-[10px] text-[#898989]">{item.desc}</div>
            </div>
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-[#d8d8d8] text-[10px] text-[#898989]">
        © 2026 InkTrace AI
      </div>
    </aside>
  )
}
