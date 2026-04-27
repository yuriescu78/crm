'use client'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { COLORS } from '@/lib/colors'

export const inputStyle: CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: `1.5px solid ${COLORS.border}`, fontSize: 13, fontFamily: 'inherit',
  outline: 'none', color: COLORS.text, background: 'white', transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}
export const selectStyle: CSSProperties = { ...inputStyle, cursor: 'pointer' }
export const textareaStyle: CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 72 }

interface BtnProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: CSSProperties
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style: extra }: BtnProps) {
  const [hover, setHover] = useState(false)
  const sizes: Record<string, CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 16px', fontSize: 13 },
    lg: { padding: '11px 22px', fontSize: 14 },
  }
  const variants: Record<string, CSSProperties> = {
    primary:   { background: hover ? COLORS.primary600 : COLORS.primary, color: 'white' },
    secondary: { background: hover ? COLORS.n100 : COLORS.n50, color: COLORS.n700, border: `1.5px solid ${COLORS.border}` },
    ghost:     { background: hover ? COLORS.primary100 : 'transparent', color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` },
    danger:    { background: hover ? COLORS.red600 : COLORS.red, color: 'white' },
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.15s', opacity: disabled ? 0.5 : 1, ...sizes[size], ...variants[variant], ...extra }}
    >
      {children}
    </button>
  )
}

export function FormField({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.textSub, marginBottom: 6, letterSpacing: '0.01em' }}>
        {label}{required && <span style={{ color: COLORS.red, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 0 }}>{children}</div>
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 38, height: 22, borderRadius: 11, background: value ? COLORS.primary : COLORS.n300, position: 'relative', cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.15s', boxShadow: '0 1px 3px oklch(0 0 0 / 0.3)' }}/>
    </div>
  )
}

export function Spinner() {
  return <div style={{ width: 22, height: 22, border: `3px solid ${COLORS.primary}30`, borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
}
