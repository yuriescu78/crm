'use client'
import { useState, useEffect } from 'react'
import { nexusDB } from '@/lib/db'
import type { CalendarEvent, Client } from '@/lib/types'
import { COLORS } from '@/lib/colors'
import { EVENT_COLORS } from '@/lib/constants'
import Modal from '@/components/ui/Modal'
import { Btn, FormField, FormRow, inputStyle, selectStyle, textareaStyle, Spinner } from '@/components/ui/Forms'

const EVENT_TYPES = Object.keys(EVENT_COLORS) as Array<keyof typeof EVENT_COLORS>

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1 // Mon=0
}

function EventChip({ event }: { event: CalendarEvent }) {
  const ec = EVENT_COLORS[event.type] ?? { color: COLORS.n500, bg: COLORS.n100 }
  return (
    <div style={{ fontSize: 10, fontWeight: 600, color: ec.color, background: ec.bg, borderRadius: 4, padding: '2px 5px', marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' }}>
      {event.title}
    </div>
  )
}

const EMPTY_FORM = {
  title: '', type: 'reunion' as CalendarEvent['type'], clientId: '',
  startAt: '', endAt: '', description: '', status: 'programado' as CalendarEvent['status'],
}

export default function CalendarioPage() {
  const [events, setEvents]   = useState<CalendarEvent[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState<'month' | 'week'>('month')
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(today)
    const day = d.getDay() === 0 ? 6 : d.getDay() - 1
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [modal, setModal]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ ...EMPTY_FORM })
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [detail, setDetail]   = useState<CalendarEvent | null>(null)

  useEffect(() => {
    Promise.all([nexusDB.events.list(), nexusDB.clients.list()])
      .then(([e, c]) => { setEvents(e); setClients(c) })
      .finally(() => setLoading(false))
  }, [])

  function eventsOnDay(d: Date) {
    const ds = d.toISOString().slice(0, 10)
    return events.filter(e => e.startAt.slice(0, 10) === ds)
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }
  function prevWeek() { setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n }) }
  function nextWeek() { setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n }) }

  function openCreate(defaultDate?: string) {
    setForm({ ...EMPTY_FORM, startAt: defaultDate ? `${defaultDate}T09:00` : '', endAt: defaultDate ? `${defaultDate}T10:00` : '' })
    setEditing(null); setDetail(null); setModal(true)
  }
  function openEdit(ev: CalendarEvent) {
    setForm({
      title: ev.title, type: ev.type, clientId: ev.clientId ?? '',
      startAt: ev.startAt.slice(0, 16), endAt: ev.endAt ? ev.endAt.slice(0, 16) : '',
      description: ev.description ?? '', status: ev.status,
    })
    setEditing(ev); setDetail(null); setModal(true)
  }

  async function handleSave() {
    if (!form.title || !form.startAt) return
    setSaving(true)
    const payload = {
      title: form.title, type: form.type,
      clientId: form.clientId || null,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
      description: form.description || null,
      status: form.status,
    }
    if (editing) {
      const updated = await nexusDB.events.update(editing.id, payload)
      if (updated) setEvents(prev => prev.map(e => e.id === editing.id ? updated : e))
    } else {
      const created = await nexusDB.events.create(payload)
      if (created) setEvents(prev => [created, ...prev])
    }
    setSaving(false); setModal(false)
  }

  async function handleDelete() {
    if (!editing) return
    setSaving(true)
    await nexusDB.events.remove(editing.id)
    setEvents(prev => prev.filter(e => e.id !== editing.id))
    setSaving(false); setModal(false)
  }

  function setF(k: keyof typeof EMPTY_FORM, v: string) { setForm(p => ({ ...p, [k]: v })) }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner />
    </div>
  )

  // Build month grid
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  // Build week days
  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    weekDays.push(d)
  }

  const todayStr = today.toISOString().slice(0, 10)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 28px', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={view === 'month' ? prevMonth : prevWeek} style={{ width: 32, height: 32, border: `1px solid ${COLORS.border}`, borderRadius: 8, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0, minWidth: 200, textAlign: 'center' }}>
            {view === 'month'
              ? `${MONTHS[month]} ${year}`
              : `${weekDays[0].toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${weekDays[6].toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`
            }
          </h1>
          <button onClick={view === 'month' ? nextMonth : nextWeek} style={{ width: 32, height: 32, border: `1px solid ${COLORS.border}`, borderRadius: 8, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: COLORS.n100, borderRadius: 8, padding: 3 }}>
            {(['month', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: view === v ? 'white' : 'transparent', color: view === v ? COLORS.text : COLORS.textMuted, boxShadow: view === v ? '0 1px 3px oklch(0 0 0 / 0.1)' : 'none', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                {v === 'month' ? 'Mes' : 'Semana'}
              </button>
            ))}
          </div>
          <Btn onClick={() => openCreate()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo evento
          </Btn>
        </div>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${COLORS.border}` }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', overflow: 'auto' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} style={{ borderRight: `1px solid ${COLORS.borderSub}`, borderBottom: `1px solid ${COLORS.borderSub}`, background: COLORS.n50 }} />
              const ds = day.toISOString().slice(0, 10)
              const dayEvents = eventsOnDay(day)
              const isToday = ds === todayStr
              return (
                <div key={ds} onClick={() => openCreate(ds)} style={{ borderRight: `1px solid ${COLORS.borderSub}`, borderBottom: `1px solid ${COLORS.borderSub}`, padding: '6px 6px 4px', cursor: 'pointer', minHeight: 80, transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = COLORS.n50)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: isToday ? COLORS.primary : 'transparent', color: isToday ? 'white' : COLORS.text, fontSize: 12, fontWeight: isToday ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>{day.getDate()}</div>
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} onClick={e => { e.stopPropagation(); setDetail(ev) }}>
                      <EventChip event={ev} />
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div style={{ fontSize: 10, color: COLORS.textMuted }}>+{dayEvents.length - 3} más</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${COLORS.border}` }}>
            {weekDays.map(day => {
              const ds = day.toISOString().slice(0, 10)
              const isToday = ds === todayStr
              return (
                <div key={ds} style={{ padding: '12px 10px', textAlign: 'center', borderRight: `1px solid ${COLORS.borderSub}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? COLORS.primary : COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{DAYS[weekDays.indexOf(day)]}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: isToday ? COLORS.primary : COLORS.text, marginTop: 2 }}>{day.getDate()}</div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, overflow: 'auto' }}>
            {weekDays.map(day => {
              const ds = day.toISOString().slice(0, 10)
              const dayEvents = eventsOnDay(day)
              return (
                <div key={ds} onClick={() => openCreate(ds)} style={{ borderRight: `1px solid ${COLORS.borderSub}`, padding: '10px 8px', cursor: 'pointer', minHeight: 200 }}
                  onMouseEnter={e => (e.currentTarget.style.background = COLORS.n50)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  {dayEvents.map(ev => {
                    const ec = EVENT_COLORS[ev.type] ?? { color: COLORS.n500, bg: COLORS.n100, label: ev.type }
                    return (
                      <div key={ev.id} onClick={e => { e.stopPropagation(); setDetail(ev) }} style={{ background: ec.bg, borderLeft: `3px solid ${ec.color}`, borderRadius: 6, padding: '6px 8px', marginBottom: 6, cursor: 'pointer' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ec.color }}>{ec.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginTop: 2 }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                          {new Date(ev.startAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                  {dayEvents.length === 0 && <div style={{ fontSize: 11, color: COLORS.textMuted, paddingTop: 8 }}>Sin eventos</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <Modal open={!!detail} onClose={() => setDetail(null)} title="Detalle del evento"
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="secondary" onClick={() => setDetail(null)}>Cerrar</Btn>
              <Btn onClick={() => openEdit(detail)}>Editar</Btn>
            </div>
          }
        >
          {(() => {
            const ec = EVENT_COLORS[detail.type] ?? { color: COLORS.n500, bg: COLORS.n100, label: detail.type }
            const client = clients.find(c => c.id === detail.clientId)
            return (
              <div>
                <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: ec.color, background: ec.bg, borderRadius: 20, padding: '3px 10px', marginBottom: 12 }}>{ec.label}</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, margin: '0 0 10px' }}>{detail.title}</h2>
                {client && <div style={{ fontSize: 13, color: COLORS.textSub, marginBottom: 8 }}>Cliente: {client.firstName} {client.lastName ?? ''}</div>}
                <div style={{ fontSize: 13, color: COLORS.textSub, marginBottom: 4 }}>
                  Inicio: {new Date(detail.startAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {detail.endAt && (
                  <div style={{ fontSize: 13, color: COLORS.textSub, marginBottom: 4 }}>
                    Fin: {new Date(detail.endAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {detail.description && <p style={{ fontSize: 13, color: COLORS.text, marginTop: 12 }}>{detail.description}</p>}
              </div>
            )
          })()}
        </Modal>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={modal} onClose={() => setModal(false)}
        title={editing ? 'Editar evento' : 'Nuevo evento'}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            {editing && <Btn variant="danger" onClick={handleDelete} disabled={saving}>Eliminar</Btn>}
            <div style={{ flex: 1 }} />
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving || !form.title || !form.startAt}>
              {saving ? <Spinner /> : (editing ? 'Guardar' : 'Crear')}
            </Btn>
          </div>
        }
      >
        <FormField label="Título" required>
          <input style={inputStyle} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Título del evento" />
        </FormField>
        <FormRow>
          <FormField label="Tipo">
            <select style={selectStyle} value={form.type} onChange={e => setF('type', e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{EVENT_COLORS[t].label}</option>)}
            </select>
          </FormField>
          <FormField label="Estado">
            <select style={selectStyle} value={form.status} onChange={e => setF('status', e.target.value)}>
              <option value="programado">Programado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </FormField>
        </FormRow>
        <FormField label="Cliente">
          <select style={selectStyle} value={form.clientId} onChange={e => setF('clientId', e.target.value)}>
            <option value="">Sin cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName ?? ''}{c.company ? ` — ${c.company}` : ''}</option>)}
          </select>
        </FormField>
        <FormRow>
          <FormField label="Inicio" required>
            <input style={inputStyle} type="datetime-local" value={form.startAt} onChange={e => setF('startAt', e.target.value)} />
          </FormField>
          <FormField label="Fin">
            <input style={inputStyle} type="datetime-local" value={form.endAt} onChange={e => setF('endAt', e.target.value)} />
          </FormField>
        </FormRow>
        <FormField label="Descripción">
          <textarea style={textareaStyle} value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Descripción opcional…" />
        </FormField>
      </Modal>
    </div>
  )
}
