import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { PenLine, Sun, BarChart3, Heart, MapPin, AlertTriangle, User } from 'lucide-react'

const items = [
  { to: '/welcome', label: 'Halaman Awal', desc: 'Mood & ringkasan', icon: Sun, color: '--color-pilar-stres' },
  { to: '/stres', label: 'Pengelolaan Stres', desc: 'Tulis & analisis', icon: PenLine, color: '--color-pilar-stres' },
  { to: '/sehat', label: 'Kebiasaan Sehat', desc: 'Tidur & olahraga', icon: Sun, color: '--color-pilar-sehat' },
  { to: '/literasi', label: 'Literasi Digital', desc: 'Grafik & insight', icon: BarChart3, color: '--color-pilar-literasi' },
  { to: '/sosial', label: 'Dukungan Sosial', desc: 'Trusted Circle', icon: Heart, color: '--color-pilar-sosial' },
  { to: '/bantuan', label: 'Akses Bantuan', desc: 'Klinik terdekat', icon: MapPin, color: '--color-pilar-bantuan' },
  { to: '/darurat', label: 'Pencegahan Risiko', desc: 'Hotline & krisis', icon: AlertTriangle, color: '--color-pilar-darurat' },
  { to: '/profil', label: 'Profil Saya', desc: 'Statistik & riwayat', icon: User, color: '--color-text' },
]

export default function SidebarDesktop() {
  const location = useLocation()

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-[var(--color-border)] z-50">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--color-border)]">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-pilar-stres)' }} />
        <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>InkTrace AI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                isActive ? 'font-medium' : 'hover:bg-[var(--color-surface)]'
              }`}
              style={{
                backgroundColor: isActive ? `var(--${item.color}-soft)` : 'transparent',
                color: isActive ? `var(${item.color})` : 'var(--color-text)',
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.5} />
              <div className="min-w-0">
                <div className="text-sm truncate">{item.label}</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </div>
            </NavLink>
          )
        })}
      </nav>

      <div className="px-5 py-3 border-t border-[var(--color-border)] text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
        InkTrace AI — Early Self-Awareness
      </div>
    </aside>
  )
}
