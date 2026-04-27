'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COLORS } from '@/lib/colors'

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard', clientes: 'Clientes', pipeline: 'Pipeline',
  calendario: 'Calendario', trabajos: 'Trabajos', telegram: 'Telegram Chat', ajustes: 'Ajustes',
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
  const router = useRouter()

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{
      height: 56, background: 'white', borderBottom: '1px solid oklch(0.93 0.01 270)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
      boxShadow: '0 1px 0 oklch(0.93 0.01 270)', flexShrink: 0,
    }}>
      <button onClick={onToggle} style={{
        width: 32, height: 32, border: 'none', background: 'oklch(0.95 0.01 270)',
        borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'oklch(0.40 0.04 270)', flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <span style={{ fontSize: 15, fontWeight: 700, color: 'oklch(0.18 0.03 270)' }}>
        {VIEW_LABELS[view] || view}
      </span>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'oklch(0.65 0.04 270)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Buscar..." style={{
            padding: '7px 12px 7px 30px', borderRadius: 8,
            border: '1px solid oklch(0.90 0.02 270)', fontSize: 12,
            outline: 'none', background: 'oklch(0.97 0.01 270)',
            width: 180, color: 'oklch(0.30 0.03 270)', fontFamily: 'inherit',
          }}/>
        </div>

        {/* Notif */}
        <button style={{
          width: 34, height: 34, border: '1px solid oklch(0.90 0.02 270)',
          borderRadius: 8, background: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'oklch(0.45 0.04 270)', position: 'relative',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'oklch(0.62 0.18 25)', border: '1.5px solid white' }}/>
        </button>

        {/* Avatar + logout menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(m => !m)} style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.amber})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 12,
          }}>
            {userInitials}
          </button>
          {showMenu && (
            <>
              <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }}/>
              <div style={{
                position: 'absolute', right: 0, top: 40, background: 'white',
                borderRadius: 10, boxShadow: '0 4px 20px oklch(0 0 0/0.12)',
                border: `1px solid ${COLORS.border}`, minWidth: 180, zIndex: 100, overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{userName}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{userEmail}</div>
                </div>
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '10px 14px', border: 'none', background: 'none',
                  textAlign: 'left', cursor: 'pointer', fontSize: 13, color: COLORS.red,
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
