'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COLORS } from '@/lib/colors'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Introduce tu email y contraseña'); return }
    setLoading(true); setError('')
    const sb = createClient()
    const { error: err } = await sb.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
          : err.message === 'Email not confirmed'
          ? 'Debes confirmar tu email antes de entrar.'
          : err.message
      )
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Introduce tu email'); return }
    setLoading(true)
    const sb = createClient()
    const { error: err } = await sb.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (err) setError(err.message)
    else setResetSent(true)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontFamily: 'inherit',
    border: `1.5px solid ${error ? COLORS.red : COLORS.border}`, fontSize: 13,
    outline: 'none', color: COLORS.text, background: 'white',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: COLORS.sidebarBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${COLORS.primary}18, transparent 70%)` }}/>
        <div style={{ position: 'absolute', bottom: -150, left: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${COLORS.amber}12, transparent 70%)` }}/>
      </div>

      <div style={{
        background: 'white', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
        boxShadow: '0 8px 32px oklch(0 0 0 / 0.2), 0 32px 80px oklch(0 0 0 / 0.15)',
        animation: 'modalSlideIn 0.28s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 12px',
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.amber})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 16px ${COLORS.primary}40`,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.03em' }}>NexusCRM</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
            {resetMode ? 'Recuperar contraseña' : 'Acceso para usuarios internos'}
          </div>
        </div>

        {!resetMode && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.textSub, marginBottom: 5 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.com" style={inp} autoFocus
                onFocus={e => (e.target.style.borderColor = COLORS.primary)}
                onBlur={e => (e.target.style.borderColor = error ? COLORS.red : COLORS.border)}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.textSub, marginBottom: 5 }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={inp}
                onFocus={e => (e.target.style.borderColor = COLORS.primary)}
                onBlur={e => (e.target.style.borderColor = error ? COLORS.red : COLORS.border)}
              />
            </div>
            {error && (
              <div style={{ padding: '9px 12px', borderRadius: 8, background: COLORS.red100, color: COLORS.red, fontSize: 12, marginBottom: 14, fontWeight: 500 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: loading ? COLORS.n300 : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary600})`,
              color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : `0 4px 12px ${COLORS.primary}35`, transition: 'all 0.15s',
            }}>
              {loading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/>
                  Entrando...
                </>
              ) : 'Entrar'}
            </button>
            <button type="button" onClick={() => { setResetMode(true); setError('') }} style={{
              width: '100%', marginTop: 12, padding: '8px', background: 'none', border: 'none',
              fontSize: 12, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}

        {resetMode && !resetSent && (
          <form onSubmit={handleReset}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.textSub, marginBottom: 5 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" style={inp} autoFocus/>
            </div>
            {error && <div style={{ padding: '9px 12px', borderRadius: 8, background: COLORS.red100, color: COLORS.red, fontSize: 12, marginBottom: 14 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: COLORS.primary, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
            <button type="button" onClick={() => { setResetMode(false); setError('') }} style={{ width: '100%', marginTop: 10, padding: 8, background: 'none', border: 'none', fontSize: 12, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Volver al login
            </button>
          </form>
        )}

        {resetMode && resetSent && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>Email enviado</div>
            <div style={{ fontSize: 12, color: COLORS.textSub, marginBottom: 20 }}>
              Revisa tu bandeja en <strong>{email}</strong>. El enlace caduca en 1 hora.
            </div>
            <button onClick={() => { setResetMode(false); setResetSent(false); setError('') }} style={{ padding: '10px 20px', background: COLORS.primary, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>
              Volver al login
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: `1px solid ${COLORS.borderSub}` }}>
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>Acceso restringido · Solo usuarios autorizados</span>
        </div>
      </div>
    </div>
  )
}
