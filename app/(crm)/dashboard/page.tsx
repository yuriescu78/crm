'use client'

import { useState, useEffect } from 'react'
import { nexusDB } from '@/lib/db'
import { COLORS } from '@/lib/colors'
import { formatDate, formatRelTime, isOverdue, isToday, initials, avatarColor, fmtCurrency } from '@/lib/utils'
import type { Client, Opportunity, Task, Activity, CalendarEvent } from '@/lib/types'
import {
  Users, TrendingUp, CheckSquare, Send,
  Phone, Mail, FileText, RefreshCw, Paperclip,
  AlertTriangle, ArrowUpRight, Clock, Circle,
} from 'lucide-react'

/* ── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ label, value, subtitle, icon, accent, delta, deltaUp }: {
  label: string; value: string | number; subtitle?: string
  icon: React.ReactNode; accent: string; delta?: string; deltaUp?: boolean
}) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px 22px',
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 1px 2px oklch(0 0 0/0.04), 0 4px 12px oklch(0 0 0/0.04)',
      display: 'flex', flexDirection: 'column', gap: 14,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
        borderRadius: '14px 14px 0 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, letterSpacing: '0.01em' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          {subtitle && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{subtitle}</span>}
          {delta && (
            <span style={{ fontSize: 11, fontWeight: 600, color: deltaUp ? COLORS.green600 : COLORS.red, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={11} style={{ transform: deltaUp ? 'none' : 'rotate(90deg)' }} />
              {delta}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Section Card ─────────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '18px 20px',
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 1px 2px oklch(0 0 0/0.04), 0 4px 12px oklch(0 0 0/0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, letterSpacing: '-0.02em' }}>{title}</span>
      {action && <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}>{action}</span>}
    </div>
  )
}

/* ── Activity ─────────────────────────────────────────────────── */
const ACT_ICON: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
  llamada:   { Icon: Phone,      color: COLORS.sky,      bg: COLORS.sky100 },
  email:     { Icon: Mail,       color: COLORS.primary,  bg: COLORS.primary100 },
  nota:      { Icon: FileText,   color: COLORS.amber,    bg: COLORS.amber100 },
  cambio:    { Icon: RefreshCw,  color: COLORS.violet,   bg: COLORS.violet100 },
  reunion:   { Icon: Users,      color: COLORS.teal,     bg: COLORS.teal100 },
  tarea:     { Icon: CheckSquare,color: COLORS.green600, bg: COLORS.green100 },
  telegram:  { Icon: Send,       color: COLORS.primary,  bg: COLORS.primary100 },
  documento: { Icon: Paperclip,  color: COLORS.amber,    bg: COLORS.amber100 },
}

function ActivityTimeline({ activities, clients }: { activities: Activity[]; clients: Client[] }) {
  if (activities.length === 0) return (
    <div style={{ padding: '20px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>Sin actividad reciente</div>
  )
  return (
    <div>
      {activities.slice(0, 6).map((act, i, arr) => {
        const { Icon, color, bg } = ACT_ICON[act.type] ?? ACT_ICON.nota
        const client = clients.find(c => c.id === act.clientId)
        return (
          <div key={act.id} style={{ display: 'flex', gap: 12, paddingBottom: 14, position: 'relative' }}>
            {i < arr.length - 1 && (
              <div style={{ position: 'absolute', left: 13, top: 28, bottom: 0, width: 1, background: COLORS.border }} />
            )}
            <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <Icon size={13} color={color} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.45, marginBottom: 3 }}>{act.description}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {client && <span style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600 }}>{client.company || `${client.firstName} ${client.lastName ?? ''}`}</span>}
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

/* ── Task item ─────────────────────────────────────────────────── */
function TaskItem({ task, clients, onToggle }: { task: Task; clients: Client[]; onToggle: (id: string) => void }) {
  const client = clients.find(c => c.id === task.clientId)
  const done    = task.status === 'completada'
  const overdue = isOverdue(task.dueDate) && !done
  const today   = isToday(task.dueDate) && !done
  const dotColors: Record<string, string> = { alta: COLORS.red, urgente: COLORS.red600, media: COLORS.amber, baja: COLORS.n300 }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 0', borderBottom: `1px solid ${COLORS.borderSub}` }}>
      <div
        onClick={() => onToggle(task.id)}
        style={{
          width: 17, height: 17, borderRadius: 5, marginTop: 1, flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${done ? COLORS.green600 : COLORS.n300}`,
          background: done ? COLORS.green600 : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {done && <svg width="8" height="8" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: done ? COLORS.textMuted : COLORS.text, textDecoration: done ? 'line-through' : 'none', lineHeight: 1.3 }}>{task.title}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
          {client && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{client.company || client.firstName}</span>}
          {task.dueDate && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: overdue ? COLORS.red100 : today ? COLORS.amber100 : COLORS.n100, color: overdue ? COLORS.red600 : today ? COLORS.amber : COLORS.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={9} />
              {overdue ? 'Vencida · ' : ''}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <Circle size={8} fill={dotColors[task.priority] ?? COLORS.n300} color={dotColors[task.priority] ?? COLORS.n300} style={{ marginTop: 5, flexShrink: 0 }} />
    </div>
  )
}

/* ── Event card ─────────────────────────────────────────────────── */
function EventCard({ event, clients }: { event: CalendarEvent; clients: Client[] }) {
  const client = clients.find(c => c.id === event.clientId)
  const d = new Date(event.startAt)
  const typeColor: Record<string, string> = { reunion: COLORS.primary, llamada: COLORS.amber, propuesta: COLORS.green, recordatorio: COLORS.violet }
  const color = typeColor[event.type] ?? COLORS.primary

  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 10, background: COLORS.n50, border: `1px solid ${COLORS.border}`, marginBottom: 8, alignItems: 'center' }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '15', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${color}25` }}>
        <div style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{d.getDate()}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: color + 'cc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.toLocaleDateString('es-ES', { month: 'short' })}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>{event.title}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {client && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{client.company || client.firstName}</span>}
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>{d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: color + '15', color, fontWeight: 700, textTransform: 'capitalize', flexShrink: 0 }}>
        {event.type}
      </span>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [clients, setClients]       = useState<Client[]>([])
  const [opps, setOpps]             = useState<Opportunity[]>([])
  const [tasks, setTasks]           = useState<Task[]>([])
  const [events, setEvents]         = useState<CalendarEvent[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      nexusDB.clients.list(), nexusDB.opportunities.list(),
      nexusDB.tasks.list(),   nexusDB.events.list(),
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
  const hour = now.getHours()
  const greeting = hour < 14 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches'
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  const activeOpps     = opps.filter(o => !['ganado', 'perdido'].includes(o.stage))
  const totalPipeline  = activeOpps.reduce((s, o) => s + o.estimatedValue, 0)
  const weightedPipeline = activeOpps.reduce((s, o) => s + (o.estimatedValue * o.probability / 100), 0)
  const leadsActivos   = clients.filter(c => !['ganado', 'perdido', 'dormido'].includes(c.status)).length
  const propuestas     = opps.filter(o => o.stage === 'propuesta').length
  const tareasHoy      = tasks.filter(t => isToday(t.dueDate) && t.status !== 'completada').length
  const tareasVencidas = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completada').length

  const clientesSinActividad = clients.filter(c => {
    if (!c.lastActivityAt) return true
    return (now.getTime() - new Date(c.lastActivityAt).getTime()) / 86400000 > 15
  })

  const alerts: string[] = []
  if (tareasVencidas > 0) alerts.push(`${tareasVencidas} tarea${tareasVencidas > 1 ? 's' : ''} vencida${tareasVencidas > 1 ? 's' : ''}`)
  if (clientesSinActividad.length > 0) alerts.push(`${clientesSinActividad.length} cliente${clientesSinActividad.length > 1 ? 's' : ''} sin actividad +15 días`)

  const todayTasks     = tasks.filter(t => isToday(t.dueDate) && t.status !== 'completada')
  const overdueTasks   = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completada')
  const upcomingEvents = events.filter(e => e.status === 'programado').slice(0, 3)
  const recentActivities = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${COLORS.primary}20`, borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.04em' }}>{greeting} 👋</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4, textTransform: 'capitalize', fontWeight: 400 }}>{dateStr}</div>
        </div>
        {alerts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: COLORS.amber100, border: `1px solid ${COLORS.amber}40`, borderRadius: 10, padding: '8px 14px' }}>
            <AlertTriangle size={14} color={COLORS.amber} />
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.amber }}>{alerts.join(' · ')}</span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KpiCard label="Leads activos" value={leadsActivos} accent={COLORS.primary}
          subtitle={`${clients.filter(c => c.status === 'nuevo').length} nuevos`}
          icon={<Users size={17} color={COLORS.primary} strokeWidth={2} />}
        />
        <KpiCard label="Pipeline total" value={fmtCurrency(totalPipeline)} accent={COLORS.green}
          subtitle={`Pond. ${fmtCurrency(Math.round(weightedPipeline))}`}
          icon={<TrendingUp size={17} color={COLORS.green600} strokeWidth={2} />}
          delta={activeOpps.length + ' oportunidades'} deltaUp
        />
        <KpiCard label="Tareas hoy" value={tareasHoy} accent={COLORS.amber}
          subtitle={tareasVencidas > 0 ? `⚠ ${tareasVencidas} vencidas` : 'Al día'}
          icon={<CheckSquare size={17} color={COLORS.amber} strokeWidth={2} />}
        />
        <KpiCard label="Propuestas" value={propuestas} accent={COLORS.violet}
          subtitle="En espera de respuesta"
          icon={<Send size={17} color={COLORS.violet} strokeWidth={2} />}
        />
      </div>

      {/* 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <SectionHeader title="Próximas reuniones" action="Ver todas →" />
            {upcomingEvents.length === 0
              ? <div style={{ fontSize: 13, color: COLORS.textMuted, padding: '12px 0' }}>No hay eventos próximos</div>
              : upcomingEvents.map(e => <EventCard key={e.id} event={e} clients={clients} />)
            }
          </Card>
          <Card>
            <SectionHeader title="Actividad reciente" action="Ver todo →" />
            <ActivityTimeline activities={recentActivities} clients={clients} />
          </Card>
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <SectionHeader title={`Tareas de hoy (${todayTasks.length})`} />
            {todayTasks.length === 0
              ? <div style={{ fontSize: 13, color: COLORS.textMuted, padding: '8px 0' }}>No hay tareas para hoy 🎉</div>
              : todayTasks.map(t => <TaskItem key={t.id} task={t} clients={clients} onToggle={toggleTask} />)
            }
          </Card>

          {overdueTasks.length > 0 && (
            <Card style={{ borderColor: COLORS.red100, borderWidth: 1.5 }}>
              <SectionHeader title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: COLORS.red }}>Tareas vencidas</span>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: COLORS.red100, color: COLORS.red600, fontWeight: 700 }}>{overdueTasks.length}</span>
                </span>
              } />
              {overdueTasks.slice(0, 4).map(t => <TaskItem key={t.id} task={t} clients={clients} onToggle={toggleTask} />)}
            </Card>
          )}

          {clientesSinActividad.length > 0 && (
            <Card>
              <SectionHeader title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  Sin actividad reciente
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: COLORS.amber100, color: COLORS.amber, fontWeight: 700 }}>{clientesSinActividad.length}</span>
                </span>
              } />
              {clientesSinActividad.slice(0, 4).map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.borderSub}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: avatarColor(c.id.charCodeAt(1)), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {initials(`${c.firstName} ${c.lastName ?? ''}`)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{c.company || `${c.firstName} ${c.lastName ?? ''}`}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>Última actividad: {formatDate(c.lastActivityAt)}</div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
