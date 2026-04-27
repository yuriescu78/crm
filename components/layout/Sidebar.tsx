'use client'

import { useRouter, usePathname } from 'next/navigation'
import { COLORS } from '@/lib/colors'
import { useState } from 'react'

/* ── Icons ── */
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M14 14h7v7h-7z"/>
  </svg>
)
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconKanban = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="8" rx="1"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconBriefcase = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
)
const IconBot = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V6"/><circle cx="12" cy="4" r="2"/>
    <path d="M6 11V9a6 6 0 0 1 12 0v2"/>
  </svg>
)
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
)

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  href: '/dashboard',  Icon: IconGrid },
  { id: 'clientes',   label: 'Clientes',   href: '/clientes',   Icon: IconUsers },
  { id: 'pipeline',   label: 'Pipeline',   href: '/pipeline',   Icon: IconKanban },
  { id: 'calendario', label: 'Calendario', href: '/calendario', Icon: IconCalendar },
  { id: 'trabajos',   label: 'Trabajos',   href: '/trabajos',   Icon: IconBriefcase },
  { id: 'telegram',   label: 'Telegram',   href: '/telegram',   Icon: IconBot, badge: true },
  { id: 'ajustes',    label: 'Ajustes',    href: '/ajustes',    Icon: IconSettings },
]

interface SidebarProps {
  collapsed: boolean
  userInitials?: string
  userName?: string
  userRole?: string
}

export default function Sidebar({ collapsed, userInitials = '?', userName = '', userRole = 'user' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const w = collapsed ? 68 : 240

  return (
    <div style={{
      width: w, minWidth: w, height: '100vh', background: COLORS.sidebarBg,
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden', flexShrink: 0,
      borderRight: '1px solid oklch(0.14 0.02 250)',
    }}>
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        padding: '0 18px', gap: 10, flexShrink: 0,
        borderBottom: '1px solid oklch(0.14 0.02 250)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.amber})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        {!collapsed && (
          <span style={{ fontSize: 15, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
            NexusCRM
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <NavItem
              key={item.id}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              onNav={() => router.push(item.href)}
            />
          )
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: '14px', borderTop: '1px solid oklch(0.14 0.02 250)',
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.amber})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: 'white',
        }}>
          {userInitials}
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            <div style={{ fontSize: 11, color: COLORS.sidebarText }}>
              {userRole === 'admin' ? 'Administrador' : 'Usuario'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function NavItem({ item, isActive, collapsed, onNav }: {
  item: typeof NAV_ITEMS[0]
  isActive: boolean
  collapsed: boolean
  onNav: () => void
}) {
  const [hover, setHover] = useState(false)
  const { label, Icon, badge } = item

  return (
    <div
      onClick={onNav}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
        padding: collapsed ? '10px 0' : '9px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10, cursor: 'pointer', marginBottom: 2,
        background: isActive ? COLORS.primary : hover ? COLORS.sidebarHover : 'transparent',
        color: isActive || hover ? 'white' : COLORS.sidebarText,
        transition: 'background 0.12s', position: 'relative',
      }}
    >
      <div style={{ flexShrink: 0, position: 'relative' }}>
        <Icon />
        {badge && (
          <div style={{
            position: 'absolute', top: -3, right: -4,
            width: 7, height: 7, borderRadius: '50%',
            background: COLORS.red, border: `1.5px solid ${COLORS.sidebarBg}`,
          }}/>
        )}
      </div>
      {!collapsed && (
        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </div>
  )
}
