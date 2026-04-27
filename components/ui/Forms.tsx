'use client'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { COLORS } from '@/lib/colors'

export const inputStyle: CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 9,
  border: `1.5px solid ${COLORS.border}`, fontSize: 13, fontFamily: 'inherit',
  outline: 'none', color: COLORS.text, background: COLORS.n50,
  transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box', letterSpacing: '-0.01em',
}
export const selectStyle: CSSProperties = { ...inputStyle, cursor: 'pointer' }
export const textareaStyle: CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }

// Inject focus styles via a global style tag approach — use onFocus/onBlur instead
export const inputFocusStyle: CSSProperties = {
  borderColor: COLORS.primary200, background: 'white',
  boxShadow: `0 0 0 3px ${COLORS.primary100}`,
}

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
    sm: { padding: '6px 12px', fontSize: 12, borderRadius: 8, gap: 5 },
    md: { padding: '8px 16px', fontSize: 13, borderRadius: 9, gap: 6 },
    lg: { padding: '10px 22px', fontSize: 14, borderRadius: 10, gap: 7 },
  }

  const variants: Record<string, CSSProperties> = {
    primary: {
      background: hover ? COLORS.primary700 : COLORS.primary,
      color: 'white',
      boxShadow: hover ? `0 4px 12px ${COLORS.primary}50` : `0 2px 6px ${COLORS.primary}30`,
    },
    secondary: {
      background: hover ? COLORS.n100 : 'white',
      color: COLORS.textSub,
      border: `1.5px solid ${COLORS.border}`,
      boxShadow: '0 1px 2px oklch(0 0 0/0.04)',
    },
    ghost: {
      background: hover ? COLORS.primary100 : 'transparent',
      color: COLORS.primary,
      border: `1.5px solid ${hover ? COLORS.primary200 : COLORS.primary200}`,
    },
    danger: {
      background: hover ? COLORS.red600 : COLORS.red,
      color: 'white',
      boxShadow: hover ? `0 4px 10px ${COLORS.red}40` : 'none',
    },
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        fontWeight: 600, transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
        letterSpacing: '-0.01em',
        ...sizes[size], ...variants[variant], ...extra,
      }}
    >
      {children}
    </button>
  )
}

export function FocusInput({ style: extra, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), ...extra }}
    />
  )
}

export function FormField({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.textSub, marginBottom: 6, letterSpacing: '0.005em' }}>
        {label}{required && <span style={{ color: COLORS.red, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  )
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, flexShrink: 0,
        background: value ? COLORS.primary : COLORS.n300,
        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
        boxShadow: value ? `0 0 0 3px ${COLORS.primary100}` : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 1px 4px oklch(0 0 0/0.25)',
      }} />
    </div>
  )
}

export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2.5px solid ${COLORS.primary}25`,
      borderTopColor: COLORS.primary,
      borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color, background: bg,
      borderRadius: 20, padding: '3px 9px', whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}>
      {children}
    </span>
  )
}
