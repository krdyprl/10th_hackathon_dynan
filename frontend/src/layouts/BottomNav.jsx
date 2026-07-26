import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Tulis', icon: '✏️' },
  { to: '/kebiasaan', label: 'Sehat', icon: '🌙' },
  { to: '/literasi', label: 'Wawasan', icon: '📊' },
  { to: '/dukungan', label: 'Sosial', icon: '💬' },
  { to: '/bantuan', label: 'Bantuan', icon: '📍' },
  { to: '/profil', label: 'Profil', icon: '👤' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#d8d8d8] md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#7a3dff]' : 'text-[#898989]'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
