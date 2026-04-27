'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COLORS } from '@/lib/colors'
import { Menu, Search, Bell, LogOut, Settings, User, ChevronDown } from 'lucide-react'

const VIEW_LABELS: Record<string, { label: string; desc: string }> = {
  dashboard:  { label: 'Dashboard',   desc: 'Resumen general' },
  clientes:   { label: 'Clientes',    desc: 'Gestión de leads y clientes' },
  pipeline:   { label: 'Pipeline',    desc: 'Oportunidades de venta' },
  calendario: { label: 'Calendario',  desc: 'Eventos y reuniones' },
  trabajos:   { label: 'Tareas',      desc: 'Gestión de tareas' },
  telegram:   { label: 'Telegram',    desc: 'Agente conversacional' },
  ajustes:    { label: 'Ajustes',     desc: 'Configuración del sistema' },
}

interface TopBarProps {
  view: string
  onToggle: () => void
  userName?: string
  userEmail?: string
  userInitials?: string
}

export default function TopBar({ view, onToggle, userName = '', userEmail = '', userInitials = '?' }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [searchFocus, setSearchFocus] = useState(false)
  const router = useRouter()
  const meta = VIEW_LABELS[view] ?? { label: view, desc: '' }

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{
      height: 60, background: 'white',
      borderBottom: `1px solid ${COLORS.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 20px 0 24px', gap: 16, flexShrink: 0,
    }}>
      {/* Toggle */}
      <button onClick={onToggle} style={{
        width: 34, height: 34, border: 'none',
        background: 'transparent', borderRadius: 8, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: COLORS.textMuted, flexShrink: 0, transition: 'background 0.12s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = COLORS.n100)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <Menu size={18} strokeWidth={1.8} />
      </button>

      {/* Page title */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {meta.label}
        </div>
        {meta.desc && (
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: 400 }}>
            {meta.desc}
          </div>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px',
          border: `1.5px solid ${searchFocus ? COLORS.primary200 : COLORS.border}`,
          borderRadius: 10, background: searchFocus ? 'white' : COLORS.n50,
          transition: 'all 0.15s', width: searchFocus ? 220 : 180,
        }}>
          <Search size={13} color={COLORS.textMuted} strokeWidth={2} />
          <input
            placeholder="Buscar..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 12, color: COLORS.text, fontFamily: 'inherit',
              width: '100%',
            }}
          />
        </div>

        {/* Notifications */}
        <button style={{
          width: 36, height: 36,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: 10, background: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: COLORS.textSub, position: 'relative', transition: 'all 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = COLORS.n50; e.currentTarget.style.borderColor = COLORS.n300 }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = COLORS.border }}
        >
          <Bell size={15} strokeWidth={1.8} />
          <div style={{
            position: 'absolute', top: 7, right: 7,
            width: 6, height: 6, borderRadius: '50%',
            background: COLORS.red, border: '1.5px solid white',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: COLORS.border, margin: '0 4px' }} />

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(m => !m)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 6px',
              border: `1.5px solid ${showMenu ? COLORS.primary200 : COLORS.border}`,
              borderRadius: 10, background: showMenu ? COLORS.primary50 : 'white',
              cursor: 'pointer', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { if (!showMenu) { e.currentTarget.style.background = COLORS.n50; e.currentTarget.style.borderColor = COLORS.n300 } }}
            onMouseLeave={e => { if (!showMenu) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = COLORS.border } }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.violet} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.02em',
            }}>
              {userInitials}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName.split(' ')[0]}
            </span>
            <ChevronDown size={12} color={COLORS.textMuted} strokeWidth={2} style={{ transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
          </button>

          {showMenu && (
            <>
              <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
              <div style={{
                position: 'absolute', right: 0, top: 46,
                background: 'white', borderRadius: 12,
                boxShadow: '0 8px 24px oklch(0 0 0/0.10), 0 2px 6px oklch(0 0 0/0.06)',
                border: `1px solid ${COLORS.border}`,
                minWidth: 200, zIndex: 100, overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.violet} 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'white',
                    }}>
                      {userInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{userName}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>{userEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '6px 8px' }}>
                  <MenuItem icon={<User size={14} strokeWidth={1.8} />} label="Mi perfil" onClick={() => { router.push('/ajustes'); setShowMenu(false) }} />
                  <MenuItem icon={<Settings size={14} strokeWidth={1.8} />} label="Ajustes" onClick={() => { router.push('/ajustes'); setShowMenu(false) }} />
                </div>
                <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '6px 8px' }}>
                  <MenuItem icon={<LogOut size={14} strokeWidth={1.8} />} label="Cerrar sesión" onClick={handleLogout} danger />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
        padding: '8px 10px', border: 'none', borderRadius: 8, cursor: 'pointer',
        background: hover ? (danger ? COLORS.red100 : COLORS.n50) : 'transparent',
        color: danger ? COLORS.red : COLORS.textSub, fontSize: 13, fontWeight: 500,
        fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.12s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}
