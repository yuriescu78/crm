'use client'
import { useEffect } from 'react'
import { COLORS } from '@/lib/colors'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  width?: number
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function Modal({ open, onClose, title, subtitle, width = 520, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'oklch(0 0 0 / 0.40)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, animation: 'modalFadeIn 0.16s ease forwards',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16,
          width, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 64px)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px oklch(0 0 0/0.12), 0 40px 80px oklch(0 0 0/0.10)',
          animation: 'modalSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
          border: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Header */}
        <div style={{
          height: 60, padding: '0 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, letterSpacing: '-0.02em' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: COLORS.textMuted, transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.n100; e.currentTarget.style.color = COLORS.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textMuted }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            borderTop: `1px solid ${COLORS.border}`,
            padding: '14px 22px',
            display: 'flex', justifyContent: 'flex-end', gap: 8,
            flexShrink: 0, background: COLORS.n50, borderRadius: '0 0 16px 16px',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
