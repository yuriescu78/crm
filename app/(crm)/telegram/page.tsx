'use client'
import { useState, useEffect } from 'react'
import { nexusDB } from '@/lib/db'
import type { TelegramMessage, TelegramUser } from '@/lib/types'
import { COLORS } from '@/lib/colors'
import { AGENT_COMMANDS } from '@/lib/constants'
import { Spinner } from '@/components/ui/Forms'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  processed:            { label: 'Procesado',       color: COLORS.green600, bg: COLORS.green100 },
  pending_confirmation: { label: 'Pendiente',        color: COLORS.amber,    bg: COLORS.amber100 },
  failed:               { label: 'Error',            color: COLORS.red600,   bg: COLORS.red100 },
}

function StatusDot({ status }: { status: string }) {
  const s = STATUS_META[status]
  if (!s) return null
  return <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 20, padding: '2px 7px' }}>{s.label}</span>
}

function Bubble({ msg, active, onClick }: { msg: TelegramMessage; active: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', gap: 10, padding: '12px 16px', cursor: 'pointer', background: active ? COLORS.primary100 : 'transparent', borderBottom: `1px solid ${COLORS.borderSub}`, transition: 'background 0.12s' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = COLORS.n50 }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.primary100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>@{msg.telegramUser}</span>
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>{new Date(msg.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textSub, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginBottom: 4 }}>{msg.text}</div>
        <StatusDot status={msg.status} />
      </div>
    </div>
  )
}

function DetailPanel({ msg, onClose }: { msg: TelegramMessage; onClose: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>@{msg.telegramUser}</span>
        <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: COLORS.n100, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Mensaje</div>
          <div style={{ background: COLORS.n50, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, color: COLORS.text }}>{msg.text}</div>
        </div>
        {msg.intent && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Intención detectada</div>
            <div style={{ background: COLORS.primary100, borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{msg.intent}</div>
          </div>
        )}
        {msg.response && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Respuesta enviada</div>
            <div style={{ background: COLORS.green100, border: `1px solid ${COLORS.green}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, color: COLORS.green600 }}>{msg.response}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>Estado</div>
            <StatusDot status={msg.status} />
          </div>
          <div style={{ flex: 1, background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Fecha</div>
            <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 600 }}>
              {new Date(msg.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TelegramPage() {
  const [messages, setMessages] = useState<TelegramMessage[]>([])
  const [users, setUsers]       = useState<TelegramUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'mensajes' | 'usuarios' | 'comandos'>('mensajes')
  const [selected, setSelected] = useState<TelegramMessage | null>(null)
  const [filter, setFilter]     = useState('')

  useEffect(() => {
    Promise.all([nexusDB.tgMessages.list(), nexusDB.tgUsers.list()])
      .then(([m, u]) => { setMessages(m); setUsers(u) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = messages.filter(m =>
    !filter || m.text.toLowerCase().includes(filter.toLowerCase()) || m.telegramUser.toLowerCase().includes(filter.toLowerCase())
  )

  const countByStatus = (s: string) => messages.filter(m => m.status === s).length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 28px', gap: 20 }}>
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Agente Telegram</h1>
        <p style={{ fontSize: 13, color: COLORS.textMuted, margin: '3px 0 0' }}>Mensajes procesados por el bot</p>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        {Object.entries(STATUS_META).map(([k, v]) => (
          <div key={k} style={{ background: v.bg, borderRadius: 10, padding: '8px 16px' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: v.color }}>{countByStatus(k)}</span>
            <span style={{ fontSize: 12, color: v.color, marginLeft: 6 }}>{v.label}</span>
          </div>
        ))}
        <div style={{ background: COLORS.n100, borderRadius: 10, padding: '8px 16px' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{users.length}</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 6 }}>Usuarios</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        {(['mensajes', 'usuarios', 'comandos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: tab === t ? COLORS.primary : COLORS.textMuted, borderBottom: `2px solid ${tab === t ? COLORS.primary : 'transparent'}`, transition: 'all 0.15s', fontFamily: 'inherit', textTransform: 'capitalize' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Mensajes tab */}
      {tab === 'mensajes' && (
        <div style={{ flex: 1, display: 'flex', gap: 16, overflow: 'hidden' }}>
          {/* List */}
          <div style={{ width: selected ? 340 : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
              <input
                style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Buscar mensajes…" value={filter} onChange={e => setFilter(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>No hay mensajes</div>
              )}
              {filtered.map(m => (
                <Bubble key={m.id} msg={m} active={selected?.id === m.id} onClick={() => setSelected(m)} />
              ))}
            </div>
          </div>

          {/* Detail */}
          {selected && <DetailPanel msg={selected} onClose={() => setSelected(null)} />}
        </div>
      )}

      {/* Usuarios tab */}
      {tab === 'usuarios' && (
        <div style={{ flex: 1, overflowY: 'auto', background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
          {users.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>No hay usuarios registrados</div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {['Usuario', 'Estado', 'Vinculado a', 'Registro'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.borderSub}` }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: COLORS.text }}>@{u.telegramUser}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: u.active ? COLORS.green600 : COLORS.n400, background: u.active ? COLORS.green100 : COLORS.n100, borderRadius: 20, padding: '2px 8px' }}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: COLORS.textSub }}>{u.userId ? u.userId.slice(0, 8) + '…' : '—'}</td>
                  <td style={{ padding: '12px 16px', color: COLORS.textSub }}>{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Comandos tab */}
      {tab === 'comandos' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {AGENT_COMMANDS.map(group => (
              <div key={group.group} style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 700, color: COLORS.text }}>{group.group}</div>
                <div style={{ padding: '8px 0' }}>
                  {group.items.map(item => (
                    <div key={item.cmd} style={{ padding: '8px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <code style={{ fontSize: 11, background: COLORS.primary100, color: COLORS.primary, borderRadius: 5, padding: '2px 6px', fontFamily: 'monospace', flexShrink: 0, whiteSpace: 'nowrap' }}>{item.cmd}</code>
                      <span style={{ fontSize: 12, color: COLORS.textSub, lineHeight: 1.5 }}>{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
