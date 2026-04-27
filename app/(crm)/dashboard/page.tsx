'use client'

import { useState, useEffect } from 'react'
import { nexusDB } from '@/lib/db'
import { COLORS } from '@/lib/colors'
import { formatDate, formatRelTime, isOverdue, isToday, initials, avatarColor, fmtCurrency } from '@/lib/utils'
import type { Client, Opportunity, Task, Activity, CalendarEvent } from '@/lib/types'

/* ── Sub-components ─────────────────────────────────────────── */

function KpiCard({ label, value, subtitle, iconBg, icon, delta, deltaPositive }: {
  label: string; value: string | number; subtitle?: string
  iconBg: string; icon: React.ReactNode; delta?: string; deltaPositive?: boolean
}) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 3px oklch(0 0 0/0.06), 0 4px 16px oklch(0 0 0/0.05)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: COLORS.textSub, fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        {subtitle && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>{subtitle}</div>}
        {delta !== undefined && (
          <div style={{ fontSize: 11, fontWeight: 500, marginTop: 4, color: deltaPositive ? COLORS.green600 : COLORS.red }}>
            {deltaPositive ? '↑' : '↓'} {delta}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{title}</span>
      {action}
    </div>
  )
}

const ACTIVITY_ICONS: Record<string, { emoji: string; color: string; bg: string }> = {
  llamada:   { emoji: '📞', color: COLORS.sky,    bg: COLORS.sky100 },
  email:     { emoji: '📧', color: COLORS.primary, bg: COLORS.primary100 },
  nota:      { emoji: '📝', color: COLORS.amber,  bg: COLORS.amber100 },
  cambio:    { emoji: '🔄', color: COLORS.violet, bg: COLORS.violet100 },
  reunion:   { emoji: '👥', color: COLORS.teal,   bg: COLORS.teal100 },
  tarea:     { emoji: '✅', color: COLORS.green600, bg: COLORS.green100 },
  telegram:  { emoji: '✈️', color: COLORS.primary, bg: COLORS.primary100 },
  documento: { emoji: '📎', color: COLORS.amber,  bg: COLORS.amber100 },
}

function ActivityTimeline({ activities, clients }: { activities: Activity[]; clients: Client[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {activities.slice(0, 6).map((act, i, arr) => {
        const info = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.nota
        const client = clients.find(c => c.id === act.clientId)
        return (
          <div key={act.id} style={{ display: 'flex', gap: 12, paddingBottom: 14, position: 'relative' }}>
            {i < arr.length - 1 && <div style={{ position: 'absolute', left: 14, top: 28, bottom: 0, width: 1, background: COLORS.border }}/>}
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: info.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, zIndex: 1 }}>
              {info.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.4, marginBottom: 2 }}>{act.description}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {client && <span style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600 }}>{client.company || `${client.firstName} ${client.lastName}`}</span>}
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{formatRelTime(act.createdAt)}</span>
                {act.origin === 'telegram' && (
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: COLORS.primary100, color: COLORS.primary, fontWeight: 700 }}>TG</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskItem({ task, clients, onToggle }: { task: Task; clients: Client[]; onToggle: (id: string) => void }) {
  const client = clients.find(c => c.id === task.clientId)
  const done = task.status === 'completada'
  const overdue = isOverdue(task.dueDate) && !done
  const today = isToday(task.dueDate) && !done
  const priorityColors: Record<string, string> = { alta: COLORS.red, media: COLORS.amber, baja: COLORS.n400, urgente: COLORS.red }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: `1px solid ${COLORS.borderSub}` }}>
      <div onClick={() => onToggle(task.id)} style={{
        width: 16, height: 16, borderRadius: 4, marginTop: 1, flexShrink: 0, cursor: 'pointer',
        border: `2px solid ${done ? COLORS.green600 : COLORS.n300}`,
        background: done ? COLORS.green600 : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done && <svg width="8" height="8" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: done ? COLORS.textMuted : COLORS.text, textDecoration: done ? 'line-through' : 'none', lineHeight: 1.3 }}>{task.title}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
          {client && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{client.company}</span>}
          {task.dueDate && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: overdue ? COLORS.red100 : today ? COLORS.amber100 : COLORS.n100, color: overdue ? COLORS.red600 : today ? COLORS.amber : COLORS.textMuted }}>
              {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[task.priority] || COLORS.n300, marginTop: 5, flexShrink: 0 }}/>
    </div>
  )
}

function UpcomingEvent({ event, clients }: { event: CalendarEvent; clients: Client[] }) {
  const client = clients.find(c => c.id === event.clientId)
  const d = new Date(event.startAt)
  const typeColors: Record<string, string> = { reunion: COLORS.primary, llamada: COLORS.amber, propuesta: COLORS.green, recordatorio: COLORS.violet }
  const color = typeColors[event.type] || COLORS.primary

  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 10, background: COLORS.n50, border: `1px solid ${COLORS.border}`, marginBottom: 8 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: color + '18', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${color}30` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1 }}>{d.getDate()}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.toLocaleDateString('es-ES', { month: 'short' })}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>{event.title}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {client && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{client.company}</span>}
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>{d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, height: 'fit-content', background: color + '18', color, fontWeight: 600, flexShrink: 0, alignSelf: 'center' }}>
        {event.type}
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */

export default function DashboardPage() {
  const [clients, setClients]       = useState<Client[]>([])
  const [opps, setOpps]             = useState<Opportunity[]>([])
  const [tasks, setTasks]           = useState<Task[]>([])
  const [events, setEvents]         = useState<CalendarEvent[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      nexusDB.clients.list(),
      nexusDB.opportunities.list(),
      nexusDB.tasks.list(),
      nexusDB.events.list(),
      nexusDB.activities.list(),
    ]).then(([c, o, t, e, a]) => {
      setClients(c); setOpps(o); setTasks(t); setEvents(e); setActivities(a)
      setLoading(false)
    })
  }, [])

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newStatus = task.status === 'completada' ? 'pendiente' : 'completada'
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    await nexusDB.tasks.update(id, { status: newStatus })
  }

  const now = new Date()
  const greeting = now.getHours() < 14 ? 'Buenos días' : now.getHours() < 21 ? 'Buenas tardes' : 'Buenas noches'
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // KPIs
  const activeOpps = opps.filter(o => !['ganado', 'perdido'].includes(o.stage))
  const totalPipeline = activeOpps.reduce((s, o) => s + o.estimatedValue, 0)
  const weightedPipeline = activeOpps.reduce((s, o) => s + (o.estimatedValue * o.probability / 100), 0)
  const leadsActivos = clients.filter(c => !['ganado', 'perdido', 'dormido'].includes(c.status)).length
  const propuestas = opps.filter(o => o.stage === 'propuesta').length
  const tareasHoy = tasks.filter(t => isToday(t.dueDate) && t.status !== 'completada').length
  const tareasVencidas = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completada').length

  const clientesSinActividad = clients.filter(c => {
    if (!c.lastActivityAt) return true
    return (now.getTime() - new Date(c.lastActivityAt).getTime()) / 86400000 > 15
  })

  const alerts: string[] = []
  if (tareasVencidas > 0) alerts.push(`${tareasVencidas} tarea${tareasVencidas > 1 ? 's' : ''} vencida${tareasVencidas > 1 ? 's' : ''}`)
  if (clientesSinActividad.length > 0) alerts.push(`${clientesSinActividad.length} cliente${clientesSinActividad.length > 1 ? 's' : ''} sin actividad +15 días`)

  const todayTasks  = tasks.filter(t => isToday(t.dueDate) && t.status !== 'completada')
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completada')
  const upcomingEvents = events.filter(e => e.status === 'programado').slice(0, 3)
  const recentActivities = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 24, height: 24, border: `3px solid ${COLORS.primary}30`, borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.03em' }}>{greeting} 👋</div>
        <div style={{ fontSize: 13, color: COLORS.textSub, marginTop: 4, textTransform: 'capitalize' }}>{dateStr}</div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ background: COLORS.amber100, border: `1px solid ${COLORS.amber}40`, borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.amber, marginBottom: 4 }}>{alerts.length} alerta{alerts.length > 1 ? 's' : ''} requieren tu atención</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {alerts.map((a, i) => (
                <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'white', color: COLORS.textSub, border: `1px solid ${COLORS.amber}30` }}>{a}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <KpiCard label="Leads activos" value={leadsActivos} iconBg={COLORS.primary100}
          subtitle={`${clients.filter(c => c.status === 'nuevo').length} nuevos este mes`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <KpiCard label="Pipeline total" value={fmtCurrency(totalPipeline)} iconBg={COLORS.green100}
          subtitle={`Pond. ${fmtCurrency(weightedPipeline)}`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.green600} strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
        />
        <KpiCard label="Tareas hoy" value={tareasHoy} iconBg={COLORS.amber100}
          subtitle={tareasVencidas > 0 ? `${tareasVencidas} vencidas` : 'Sin tareas vencidas'}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
        />
        <KpiCard label="Propuestas" value={propuestas} iconBg={COLORS.violet100}
          subtitle="En espera de respuesta"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.violet} strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>}
        />
      </div>

      {/* 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Left */}
        <div>
          <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', marginBottom: 18, boxShadow: '0 1px 3px oklch(0 0 0/0.06), 0 4px 16px oklch(0 0 0/0.05)' }}>
            <SectionHeader title="Próximas reuniones" action={<span style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}>Ver todas →</span>}/>
            {upcomingEvents.length === 0
              ? <div style={{ fontSize: 12, color: COLORS.textMuted, padding: '8px 0' }}>No hay eventos próximos</div>
              : upcomingEvents.map(e => <UpcomingEvent key={e.id} event={e} clients={clients}/>)
            }
          </div>
          <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px oklch(0 0 0/0.06), 0 4px 16px oklch(0 0 0/0.05)' }}>
            <SectionHeader title="Actividad reciente" action={<span style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}>Ver todo →</span>}/>
            <ActivityTimeline activities={recentActivities} clients={clients}/>
          </div>
        </div>

        {/* Right */}
        <div>
          <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', marginBottom: 18, boxShadow: '0 1px 3px oklch(0 0 0/0.06), 0 4px 16px oklch(0 0 0/0.05)' }}>
            <SectionHeader title={`Tareas de hoy (${todayTasks.length})`}/>
            {todayTasks.length === 0
              ? <div style={{ fontSize: 12, color: COLORS.textMuted, padding: '8px 0' }}>No hay tareas para hoy 🎉</div>
              : todayTasks.map(t => <TaskItem key={t.id} task={t} clients={clients} onToggle={toggleTask}/>)
            }
          </div>

          {overdueTasks.length > 0 && (
            <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', marginBottom: 18, border: `1.5px solid ${COLORS.red100}`, boxShadow: '0 1px 3px oklch(0 0 0/0.06)' }}>
              <SectionHeader title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.red }}>Tareas vencidas</span>
                  <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: COLORS.red100, color: COLORS.red600, fontWeight: 700 }}>{overdueTasks.length}</span>
                </span>
              }/>
              {overdueTasks.map(t => <TaskItem key={t.id} task={t} clients={clients} onToggle={toggleTask}/>)}
            </div>
          )}

          {clientesSinActividad.length > 0 && (
            <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px oklch(0 0 0/0.06)' }}>
              <SectionHeader title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Sin actividad reciente</span>
                  <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: COLORS.amber100, color: COLORS.amber, fontWeight: 700 }}>{clientesSinActividad.length}</span>
                </span>
              }/>
              {clientesSinActividad.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.borderSub}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(c.id.charCodeAt(1)), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {initials(`${c.firstName} ${c.lastName || ''}`)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{c.company || `${c.firstName} ${c.lastName}`}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>Última actividad: {formatDate(c.lastActivityAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
