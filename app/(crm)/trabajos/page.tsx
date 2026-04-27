'use client'
import { useState, useEffect } from 'react'
import { nexusDB } from '@/lib/db'
import type { Task, Client } from '@/lib/types'
import { COLORS } from '@/lib/colors'
import { TASK_STATUSES, TASK_KANBAN_COLS } from '@/lib/constants'
import Modal from '@/components/ui/Modal'
import { Btn, FormField, FormRow, inputStyle, selectStyle, textareaStyle, Spinner } from '@/components/ui/Forms'

const PRIORITIES = ['baja', 'media', 'alta', 'urgente'] as const
const PRIORITY_COLOR: Record<string, string> = {
  baja: COLORS.n400, media: COLORS.amber, alta: COLORS.red, urgente: COLORS.red600,
}

function PriorityDot({ priority }: { priority: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLOR[priority] ?? COLORS.n400, display: 'inline-block', flexShrink: 0 }} />
}

function StatusBadge({ status }: { status: string }) {
  const s = TASK_STATUSES[status]
  if (!s) return null
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function TaskCard({
  task, clients, dragId,
  onDragStart, onDragEnd, onClick,
}: {
  task: Task; clients: Client[]; dragId: string | null
  onDragStart: () => void; onDragEnd: () => void; onClick: () => void
}) {
  const client = clients.find(c => c.id === task.clientId)
  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completada'
  return (
    <div
      draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}
      style={{
        background: 'white', border: `1px solid ${overdue ? COLORS.red : COLORS.border}`,
        borderRadius: 10, padding: '11px 13px', marginBottom: 8,
        cursor: 'grab', opacity: dragId === task.id ? 0.4 : 1,
        boxShadow: dragId === task.id ? 'none' : '0 1px 3px oklch(0 0 0 / 0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
        <PriorityDot priority={task.priority} />
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, lineHeight: 1.3 }}>{task.title}</span>
      </div>
      {client && <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 5 }}>{client.firstName} {client.lastName ?? ''}</div>}
      {task.dueDate && (
        <div style={{ fontSize: 11, color: overdue ? COLORS.red : COLORS.textMuted }}>
          {overdue ? '⚠ ' : ''}Vence: {new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
        </div>
      )}
    </div>
  )
}

function KanbanCol({
  col, tasks, clients, dragId, dragOver,
  onDragOver, onDrop, onLeave, onDragStart, onDragEnd, onCardClick,
}: {
  col: typeof TASK_KANBAN_COLS[number]
  tasks: Task[]; clients: Client[]; dragId: string | null; dragOver: string | null
  onDragOver: (id: string) => void; onDrop: (id: string) => void; onLeave: () => void
  onDragStart: (id: string) => void; onDragEnd: () => void; onCardClick: (t: Task) => void
}) {
  const isOver = dragOver === col.id
  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(col.id) }}
      onDrop={() => onDrop(col.id)}
      onDragLeave={onLeave}
      style={{
        minWidth: 220, width: 220, flexShrink: 0,
        background: isOver ? COLORS.primary100 : COLORS.n50,
        border: `1.5px solid ${isOver ? COLORS.primary200 : COLORS.border}`,
        borderRadius: 12, display: 'flex', flexDirection: 'column', transition: 'all 0.15s',
      }}
    >
      <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{col.label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: '1px 8px', color: COLORS.textSub }}>{tasks.length}</span>
      </div>
      <div style={{ flex: 1, padding: '10px 10px 4px', overflowY: 'auto', minHeight: 80 }}>
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} clients={clients} dragId={dragId}
            onDragStart={() => onDragStart(t.id)}
            onDragEnd={onDragEnd}
            onClick={() => onCardClick(t)}
          />
        ))}
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 12, paddingTop: 24 }}>Sin tareas</div>
        )}
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  title: '', clientId: '', status: 'pendiente' as Task['status'],
  priority: 'media' as Task['priority'], dueDate: '', description: '',
}

export default function TrabajosPage() {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState<'kanban' | 'list'>('kanban')
  const [filter, setFilter]   = useState('')
  const [dragId, setDragId]   = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [modal, setModal]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ ...EMPTY_FORM })
  const [editing, setEditing] = useState<Task | null>(null)

  useEffect(() => {
    Promise.all([nexusDB.tasks.list(), nexusDB.clients.list()])
      .then(([t, c]) => { setTasks(t); setClients(c) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = tasks.filter(t =>
    !filter || t.title.toLowerCase().includes(filter.toLowerCase())
  )

  async function handleDrop(targetStatus: string) {
    if (!dragId) return
    const task = tasks.find(t => t.id === dragId)
    if (!task || task.status === targetStatus) { setDragId(null); setDragOver(null); return }
    setTasks(prev => prev.map(t => t.id === dragId ? { ...t, status: targetStatus as Task['status'] } : t))
    setDragId(null); setDragOver(null)
    await nexusDB.tasks.update(dragId, { status: targetStatus as Task['status'] })
  }

  function openCreate() { setForm({ ...EMPTY_FORM }); setEditing(null); setModal(true) }
  function openEdit(t: Task) {
    setForm({
      title: t.title, clientId: t.clientId ?? '', status: t.status,
      priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
      description: t.description ?? '',
    })
    setEditing(t); setModal(true)
  }

  async function handleSave() {
    if (!form.title) return
    setSaving(true)
    const payload = {
      title: form.title, clientId: form.clientId || null, status: form.status,
      priority: form.priority, dueDate: form.dueDate || null,
      description: form.description || null,
    }
    if (editing) {
      const updated = await nexusDB.tasks.update(editing.id, payload)
      if (updated) setTasks(prev => prev.map(t => t.id === editing.id ? updated : t))
    } else {
      const created = await nexusDB.tasks.create(payload)
      if (created) setTasks(prev => [created, ...prev])
    }
    setSaving(false); setModal(false)
  }

  async function handleDelete() {
    if (!editing) return
    setSaving(true)
    await nexusDB.tasks.remove(editing.id)
    setTasks(prev => prev.filter(t => t.id !== editing.id))
    setSaving(false); setModal(false)
  }

  function setF(k: keyof typeof EMPTY_FORM, v: string) { setForm(p => ({ ...p, [k]: v })) }

  const countByStatus = (s: string) => tasks.filter(t => t.status === s).length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 28px', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Tareas</h1>
          <p style={{ fontSize: 13, color: COLORS.textMuted, margin: '3px 0 0' }}>{tasks.length} tareas en total</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: COLORS.n100, borderRadius: 8, padding: 3 }}>
            {(['kanban', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: view === v ? 'white' : 'transparent', color: view === v ? COLORS.text : COLORS.textMuted, boxShadow: view === v ? '0 1px 3px oklch(0 0 0 / 0.1)' : 'none', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                {v === 'kanban' ? 'Tablero' : 'Lista'}
              </button>
            ))}
          </div>
          <Btn onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva tarea
          </Btn>
        </div>
      </div>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
        {TASK_KANBAN_COLS.map(col => {
          const s = TASK_STATUSES[col.id]
          return (
            <div key={col.id} style={{ background: s.bg, borderRadius: 20, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{countByStatus(col.id)}</span>
              <span style={{ fontSize: 12, color: s.color }}>{col.label}</span>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div style={{ flexShrink: 0 }}>
        <input
          style={{ ...inputStyle, maxWidth: 340 }} placeholder="Buscar tarea…"
          value={filter} onChange={e => setFilter(e.target.value)}
        />
      </div>

      {/* Kanban view */}
      {view === 'kanban' && (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', flex: 1, paddingBottom: 16, alignItems: 'flex-start' }}>
          {TASK_KANBAN_COLS.map(col => (
            <KanbanCol
              key={col.id} col={col} clients={clients}
              tasks={filtered.filter(t => t.status === col.id)}
              dragId={dragId} dragOver={dragOver}
              onDragOver={setDragOver} onDrop={handleDrop} onLeave={() => setDragOver(null)}
              onDragStart={setDragId} onDragEnd={() => setDragId(null)}
              onCardClick={openEdit}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div style={{ flex: 1, overflowY: 'auto', background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {['Tarea', 'Cliente', 'Estado', 'Prioridad', 'Vencimiento'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const client = clients.find(c => c.id === t.clientId)
                const overdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completada'
                return (
                  <tr key={t.id} onClick={() => openEdit(t)} style={{ borderBottom: `1px solid ${COLORS.borderSub}`, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.n50)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: COLORS.text }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PriorityDot priority={t.priority} />
                        {t.title}
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', color: COLORS.textSub }}>
                      {client ? `${client.firstName} ${client.lastName ?? ''}` : '—'}
                    </td>
                    <td style={{ padding: '11px 16px' }}><StatusBadge status={t.status} /></td>
                    <td style={{ padding: '11px 16px', color: PRIORITY_COLOR[t.priority], fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</td>
                    <td style={{ padding: '11px 16px', color: overdue ? COLORS.red : COLORS.textSub }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: COLORS.textMuted }}>No hay tareas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal} onClose={() => setModal(false)}
        title={editing ? 'Editar tarea' : 'Nueva tarea'}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            {editing && <Btn variant="danger" onClick={handleDelete} disabled={saving}>Eliminar</Btn>}
            <div style={{ flex: 1 }} />
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving || !form.title}>
              {saving ? <Spinner /> : (editing ? 'Guardar' : 'Crear')}
            </Btn>
          </div>
        }
      >
        <FormField label="Título" required>
          <input style={inputStyle} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Nombre de la tarea" />
        </FormField>
        <FormField label="Cliente">
          <select style={selectStyle} value={form.clientId} onChange={e => setF('clientId', e.target.value)}>
            <option value="">Sin cliente asignado</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName ?? ''}{c.company ? ` — ${c.company}` : ''}</option>
            ))}
          </select>
        </FormField>
        <FormRow>
          <FormField label="Estado">
            <select style={selectStyle} value={form.status} onChange={e => setF('status', e.target.value)}>
              {Object.entries(TASK_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </FormField>
          <FormField label="Prioridad">
            <select style={selectStyle} value={form.priority} onChange={e => setF('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormField label="Fecha límite">
          <input style={inputStyle} type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} />
        </FormField>
        <FormField label="Descripción">
          <textarea style={textareaStyle} value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Descripción opcional…" />
        </FormField>
      </Modal>
    </div>
  )
}
