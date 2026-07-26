import React from 'react'
import { NavLink } from 'react-router-dom'
import { PenLine, Sun, BarChart3, Heart, MapPin, User } from 'lucide-react'

const items = [
  { to: '/welcome', label: 'Awal', icon: Sun, color: 'var(--color-pilar-stres)' },
  { to: '/stres', label: 'Tulis', icon: PenLine, color: 'var(--color-pilar-stres)' },
  { to: '/sehat', label: 'Sehat', icon: Sun, color: 'var(--color-pilar-sehat)' },
  { to: '/literasi', label: 'Wawasan', icon: BarChart3, color: 'var(--color-pilar-literasi)' },
  { to: '/sosial', label: 'Sosial', icon: Heart, color: 'var(--color-pilar-sosial)' },
  { to: '/bantuan', label: 'Bantuan', icon: MapPin, color: 'var(--color-pilar-bantuan)' },
  { to: '/profil', label: 'Profil', icon: User, color: 'var(--color-text-muted)' },
]

export default function NavbarBottom() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-border)] md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium transition-all min-w-0 ${
                  isActive ? 'scale-105' : 'text-[var(--color-text-muted)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isActive ? item.color : undefined }}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span style={{ color: isActive ? item.color : undefined }}>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
