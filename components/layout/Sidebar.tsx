'use client'

import { useRouter, usePathname } from 'next/navigation'
import { COLORS } from '@/lib/colors'
import { useState } from 'react'
import {
  LayoutDashboard, Users, TrendingUp, Calendar,
  CheckSquare, Send, Settings, ChevronRight,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard',  label: 'Dashboard',  href: '/dashboard',  Icon: LayoutDashboard },
      { id: 'clientes',   label: 'Clientes',   href: '/clientes',   Icon: Users },
      { id: 'pipeline',   label: 'Pipeline',   href: '/pipeline',   Icon: TrendingUp },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { id: 'trabajos',   label: 'Tareas',     href: '/trabajos',   Icon: CheckSquare },
      { id: 'calendario', label: 'Calendario', href: '/calendario', Icon: Calendar },
      { id: 'telegram',   label: 'Telegram',   href: '/telegram',   Icon: Send, badge: true },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'ajustes',    label: 'Ajustes',    href: '/ajustes',    Icon: Settings },
    ],
  },
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
  const w = collapsed ? 72 : 248

  return (
    <div style={{
      width: w, minWidth: w, height: '100vh',
      background: COLORS.sidebarBg,
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden', flexShrink: 0,
      borderRight: `1px solid ${COLORS.sidebarBorder}`,
    }}>
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 20px' : '0 20px', gap: 12, flexShrink: 0,
        borderBottom: `1px solid ${COLORS.sidebarBorder}`,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.violet} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${COLORS.primary}40`,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.03em', lineHeight: 1 }}>NexusCRM</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 500, marginTop: 1 }}>Workspace</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            {!collapsed && (
              <div style={{
                fontSize: 10, fontWeight: 700, color: COLORS.textMuted,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '6px 8px 4px', marginBottom: 2,
              }}>
                {group.label}
              </div>
            )}
            {collapsed && <div style={{ height: 4 }} />}
            {group.items.map(item => {
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
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{
        padding: '12px 10px', borderTop: `1px solid ${COLORS.sidebarBorder}`,
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '8px 0' : '8px 10px',
          borderRadius: 10, justifyContent: collapsed ? 'center' : 'flex-start',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = COLORS.sidebarHover)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.violet} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.02em',
          }}>
            {userInitials}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userName}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                  {userRole === 'admin' ? 'Administrador' : 'Usuario'}
                </div>
              </div>
              <ChevronRight size={14} color={COLORS.textMuted} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NavItem({ item, isActive, collapsed, onNav }: {
  item: { label: string; Icon: React.ElementType; badge?: boolean }
  isActive: boolean
  collapsed: boolean
  onNav: () => void
}) {
  const [hover, setHover] = useState(false)
  const { label, Icon, badge } = item

  const bg = isActive ? COLORS.sidebarActive : hover ? COLORS.sidebarHover : 'transparent'
  const color = isActive ? COLORS.sidebarActiveText : hover ? COLORS.text : COLORS.sidebarText

  return (
    <div
      onClick={onNav}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '9px 0' : '8px 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 9, cursor: 'pointer', marginBottom: 1,
        background: bg, color,
        transition: 'all 0.12s',
        position: 'relative',
      }}
    >
      {isActive && !collapsed && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', height: '60%',
          width: 3, borderRadius: 2,
          background: COLORS.primary,
        }} />
      )}
      <div style={{ flexShrink: 0, position: 'relative', display: 'flex' }}>
        <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
        {badge && (
          <div style={{
            position: 'absolute', top: -2, right: -3,
            width: 6, height: 6, borderRadius: '50%',
            background: COLORS.red, border: `1.5px solid white`,
          }} />
        )}
      </div>
      {!collapsed && (
        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
          {label}
        </span>
      )}
    </div>
  )
}
