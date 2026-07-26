import React from 'react'
import { Outlet } from 'react-router-dom'
import NavbarBottom from './NavbarBottom'
import SidebarDesktop from './SidebarDesktop'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans antialiased">
      <SidebarDesktop />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
      <NavbarBottom />
    </div>
  )
}
