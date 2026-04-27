'use client'
import { useState, useEffect, useRef } from 'react'
import { nexusDB, nexusLogActivity } from '@/lib/db'
import type { Opportunity, Client } from '@/lib/types'
import { COLORS } from '@/lib/colors'
import { PIPELINE_STAGES } from '@/lib/constants'
import Modal from '@/components/ui/Modal'
import { Btn, FormField, FormRow, inputStyle, selectStyle, textareaStyle, Spinner } from '@/components/ui/Forms'
import { Plus, LayoutGrid, List, MoreHorizontal } from 'lucide-react'

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M€`
  : n >= 1_000   ? `${(n / 1_000).toFixed(0)}k€`
  : `${n}€`

/* ── Stat cards ─────────────────────────────────────────── */
function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '16px 20px', flex: 1, position: 'relative', overflow: 'hidden' }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '12px 12px 0 0' }} />}
      <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.03em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

/* ── Stage badge ────────────────────────────────────────── */
function StageBadge({ stage }: { stage: string }) {
  const s = PIPELINE_STAGES.find(p => p.id === stage)
  if (!s) return <span style={{ fontSize: 12, color: COLORS.textMuted }}>{stage}</span>
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.color + '18', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

/* ── Table view ─────────────────────────────────────────── */
function TableView({ opps, clients, onEdit }: { opps: Opportunity[]; clients: Client[]; onEdit: (o: Opportunity) => void }) {
  const [hover, setHover] = useState<string | null>(null)

  const cols = [
    { key: 'oportunidad', label: 'Oportunidad', w: '30%' },
    { key: 'cliente',     label: 'Cliente',      w: '20%' },
    { key: 'etapa',       label: 'Etapa',        w: '15%' },
    { key: 'valor',       label: 'Valor',        w: '12%' },
    { key: 'prob',        label: 'Prob.',        w: '8%'  },
    { key: 'cierre',      label: 'Cierre',       w: '12%' },
    { key: 'acciones',    label: '',             w: '3%'  },
  ]

  return (
    <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: 'hidden', boxShadow: '0 1px 2px oklch(0 0 0/0.04), 0 4px 12px oklch(0 0 0/0.04)' }}>
      {/* Table header */}
      <div style={{ display: 'flex', padding: '0 24px', borderBottom: `1px solid ${COLORS.border}`, background: COLORS.n50 }}>
        {cols.map(col => (
          <div key={col.key} style={{ width: col.w, padding: '13px 0 13px', paddingRight: 12, fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      {opps.length === 0 && (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>
          No hay oportunidades. Crea la primera.
        </div>
      )}
      {opps.map(opp => {
        const client = clients.find(c => c.id === opp.clientId)
        const clientName = client ? `${client.firstName} ${client.lastName ?? ''}`.trim() : '—'
        const stage = PIPELINE_STAGES.find(s => s.id === opp.stage)
        const isHover = hover === opp.id

        return (
          <div
            key={opp.id}
            onMouseEnter={() => setHover(opp.id)}
            onMouseLeave={() => setHover(null)}
            style={{ display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: `1px solid ${COLORS.borderSub}`, background: isHover ? COLORS.n50 : 'white', transition: 'background 0.12s', cursor: 'pointer' }}
            onClick={() => onEdit(opp)}
          >
            {/* Oportunidad */}
            <div style={{ width: cols[0].w, padding: '14px 12px 14px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: (stage?.color ?? COLORS.primary) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage?.color ?? COLORS.primary }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opp.title}</div>
                {opp.description && <div style={{ fontSize: 11, color: COLORS.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{opp.description}</div>}
              </div>
            </div>

            {/* Cliente */}
            <div style={{ width: cols[1].w, paddingRight: 12 }}>
              <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{clientName}</div>
              {client?.company && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>{client.company}</div>}
            </div>

            {/* Etapa */}
            <div style={{ width: cols[2].w, paddingRight: 12 }}>
              <StageBadge stage={opp.stage} />
            </div>

            {/* Valor — destacado en primary */}
            <div style={{ width: cols[3].w, paddingRight: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary }}>{fmt(opp.estimatedValue || 0)}</span>
            </div>

            {/* Prob */}
            <div style={{ width: cols[4].w, paddingRight: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: COLORS.n200, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${opp.probability}%`, background: COLORS.primary, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, color: COLORS.textMuted, flexShrink: 0 }}>{opp.probability}%</span>
              </div>
            </div>

            {/* Cierre */}
            <div style={{ width: cols[5].w, paddingRight: 12 }}>
              <span style={{ fontSize: 12, color: COLORS.textSub }}>
                {opp.expectedCloseDate
                  ? new Date(opp.expectedCloseDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </div>

            {/* Acciones */}
            <div style={{ width: cols[6].w }} onClick={e => e.stopPropagation()}>
              <button onClick={() => onEdit(opp)} style={{ width: 28, height: 28, border: 'none', background: isHover ? COLORS.n200 : 'transparent', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted, transition: 'all 0.12s' }}>
                <MoreHorizontal size={15} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Kanban card ────────────────────────────────────────── */
function OppCard({ opp, clients, dragging, onDragStart, onDragEnd, onClick }: {
  opp: Opportunity; clients: Client[]; dragging: boolean
  onDragStart: () => void; onDragEnd: () => void; onClick: () => void
}) {
  const client = clients.find(c => c.id === opp.clientId)
  const name = client ? `${client.firstName} ${client.lastName ?? ''}`.trim() : '—'
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}
      style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'grab', opacity: dragging ? 0.4 : 1, transition: 'all 0.15s', boxShadow: dragging ? 'none' : '0 1px 4px oklch(0 0 0/0.06)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4, lineHeight: 1.3 }}>{opp.title}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 10 }}>{name}{client?.company ? ` · ${client.company}` : ''}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary }}>{fmt(opp.estimatedValue)}</span>
        <span style={{ fontSize: 11, color: COLORS.textMuted, background: COLORS.n100, borderRadius: 6, padding: '2px 7px' }}>{opp.probability}%</span>
      </div>
      {opp.expectedCloseDate && (
        <div style={{ marginTop: 6, fontSize: 11, color: COLORS.textMuted }}>
          Cierre: {new Date(opp.expectedCloseDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
        </div>
      )}
    </div>
  )
}

/* ── Kanban column ──────────────────────────────────────── */
function KanbanCol({ stage, opps, clients, dragOverStage, dragId, onDragOver, onDrop, onLeave, onDragStart, onDragEnd, onCardClick }: {
  stage: typeof PIPELINE_STAGES[number]; opps: Opportunity[]; clients: Client[]
  dragOverStage: string | null; dragId: string | null
  onDragOver: (id: string) => void; onDrop: (id: string) => void; onLeave: () => void
  onDragStart: (id: string) => void; onDragEnd: () => void; onCardClick: (o: Opportunity) => void
}) {
  const isOver = dragOverStage === stage.id
  const total = opps.reduce((s, o) => s + (o.estimatedValue || 0), 0)
  return (
    <div onDragOver={e => { e.preventDefault(); onDragOver(stage.id) }} onDrop={() => onDrop(stage.id)} onDragLeave={onLeave}
      style={{ minWidth: 220, width: 220, flexShrink: 0, background: isOver ? COLORS.primary100 : COLORS.n50, borderRadius: 12, border: `1.5px solid ${isOver ? COLORS.primary200 : COLORS.border}`, transition: 'all 0.15s', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: stage.color }}>{stage.label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: '1px 8px', color: COLORS.textSub }}>{opps.length}</span>
        </div>
        {total > 0 && <div style={{ fontSize: 11, color: COLORS.textMuted }}>{fmt(total)}</div>}
      </div>
      <div style={{ flex: 1, padding: '10px 10px 4px', overflowY: 'auto', minHeight: 80 }}>
        {opps.map(o => (
          <OppCard key={o.id} opp={o} clients={clients} dragging={dragId === o.id}
            onDragStart={() => onDragStart(o.id)} onDragEnd={onDragEnd} onClick={() => onCardClick(o)} />
        ))}
        {opps.length === 0 && <div style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 12, paddingTop: 24 }}>Sin oportunidades</div>}
      </div>
    </div>
  )
}

/* ── Form & page ────────────────────────────────────────── */
const EMPTY_FORM = {
  title: '', clientId: '', stage: 'nuevo' as Opportunity['stage'],
  estimatedValue: '', probability: '50', description: '', expectedCloseDate: '',
}

export default function PipelinePage() {
  const [opps, setOpps]         = useState<Opportunity[]>([])
  const [clients, setClients]   = useState<Client[]>([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<'kanban' | 'table'>('table')
  const [dragId, setDragId]     = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [modal, setModal]       = useState(false)
  const [detail, setDetail]     = useState<Opportunity | null>(null)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ ...EMPTY_FORM })
  const [editMode, setEditMode] = useState(false)
  const saveRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    Promise.all([nexusDB.opportunities.list(), nexusDB.clients.list()])
      .then(([o, c]) => { setOpps(o); setClients(c) })
      .finally(() => setLoading(false))
  }, [])

  const activeOpps  = opps.filter(o => o.stage !== 'ganado' && o.stage !== 'perdido')
  const totalPipeline = activeOpps.reduce((s, o) => s + (o.estimatedValue || 0), 0)
  const weighted    = opps.filter(o => o.stage !== 'perdido').reduce((s, o) => s + ((o.estimatedValue || 0) * (o.probability || 0) / 100), 0)
  const ganadas     = opps.filter(o => o.stage === 'ganado')
  const ganadasVal  = ganadas.reduce((s, o) => s + (o.estimatedValue || 0), 0)

  async function handleDrop(targetStage: string) {
    if (!dragId) return
    const opp = opps.find(o => o.id === dragId)
    if (!opp || opp.stage === targetStage) { setDragId(null); setDragOver(null); return }
    setOpps(prev => prev.map(o => o.id === dragId ? { ...o, stage: targetStage as Opportunity['stage'] } : o))
    setDragId(null); setDragOver(null)
    const updated = await nexusDB.opportunities.update(dragId, { stage: targetStage as Opportunity['stage'] })
    if (!updated) setOpps(prev => prev.map(o => o.id === dragId ? { ...o, stage: opp.stage } : o))
    else nexusLogActivity({ opportunityId: dragId, type: 'cambio', description: `Pipeline movido a ${targetStage}`, origin: 'web' })
  }

  function openCreate() { setForm({ ...EMPTY_FORM }); setEditMode(false); setDetail(null); setModal(true) }
  function openEdit(opp: Opportunity) {
    setForm({ title: opp.title, clientId: opp.clientId, stage: opp.stage, estimatedValue: String(opp.estimatedValue || ''), probability: String(opp.probability || 50), description: opp.description || '', expectedCloseDate: opp.expectedCloseDate ? opp.expectedCloseDate.slice(0, 10) : '' })
    setEditMode(true); setDetail(opp); setModal(true)
  }

  async function handleSave() {
    if (!form.title || !form.clientId) return
    setSaving(true)
    const payload = { title: form.title, clientId: form.clientId, stage: form.stage, estimatedValue: Number(form.estimatedValue) || 0, probability: Number(form.probability) || 0, weightedValue: (Number(form.estimatedValue) || 0) * (Number(form.probability) || 0) / 100, description: form.description || null, expectedCloseDate: form.expectedCloseDate || null }
    if (editMode && detail) {
      const updated = await nexusDB.opportunities.update(detail.id, payload)
      if (updated) setOpps(prev => prev.map(o => o.id === detail.id ? updated : o))
    } else {
      const created = await nexusDB.opportunities.create(payload)
      if (created) setOpps(prev => [created, ...prev])
    }
    setSaving(false); setModal(false)
  }

  async function handleDelete() {
    if (!detail) return
    setSaving(true)
    await nexusDB.opportunities.remove(detail.id)
    setOpps(prev => prev.filter(o => o.id !== detail.id))
    setSaving(false); setModal(false)
  }

  function setF(k: keyof typeof EMPTY_FORM, v: string) { setForm(p => ({ ...p, [k]: v })) }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: '-0.03em' }}>Pipeline de ventas</h1>
          <p style={{ fontSize: 13, color: COLORS.textMuted, margin: '3px 0 0' }}>{opps.length} oportunidades</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: COLORS.n100, borderRadius: 9, padding: 3, gap: 2 }}>
            {([{ v: 'table', Icon: List }, { v: 'kanban', Icon: LayoutGrid }] as const).map(({ v, Icon }) => (
              <button key={v} onClick={() => setView(v)} style={{ width: 32, height: 32, border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: view === v ? 'white' : 'transparent', color: view === v ? COLORS.primary : COLORS.textMuted, boxShadow: view === v ? '0 1px 3px oklch(0 0 0/0.1)' : 'none', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                <Icon size={15} strokeWidth={1.8} />
              </button>
            ))}
          </div>
          <Btn onClick={openCreate}>
            <Plus size={14} strokeWidth={2.5} /> Nueva oportunidad
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        <StatCard label="Total pipeline" value={fmt(totalPipeline)} sub={`${activeOpps.length} oportunidades`} accent={COLORS.primary} />
        <StatCard label="Valor ponderado" value={fmt(Math.round(weighted))} sub="por probabilidad" accent={COLORS.violet} />
        <StatCard label="Ganadas" value={fmt(ganadasVal)} sub={`${ganadas.length} cerradas`} accent={COLORS.green} />
        <StatCard label="Conversión" value={opps.length ? `${Math.round(ganadas.length / opps.length * 100)}%` : '—'} sub="tasa de cierre" accent={COLORS.amber} />
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <TableView opps={opps} clients={clients} onEdit={openEdit} />
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', flex: 1, paddingBottom: 16, alignItems: 'flex-start' }}>
          {PIPELINE_STAGES.map(stage => (
            <KanbanCol key={stage.id} stage={stage} opps={opps.filter(o => o.stage === stage.id)} clients={clients} dragId={dragId} dragOverStage={dragOver} onDragOver={setDragOver} onDrop={handleDrop} onLeave={() => setDragOver(null)} onDragStart={setDragId} onDragEnd={() => setDragId(null)} onCardClick={openEdit} />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editMode ? 'Editar oportunidad' : 'Nueva oportunidad'}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            {editMode && <Btn variant="danger" onClick={handleDelete} disabled={saving}>Eliminar</Btn>}
            <div style={{ flex: 1 }} />
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={handleSave} disabled={saving || !form.title || !form.clientId}>
              {saving ? <Spinner /> : (editMode ? 'Guardar' : 'Crear')}
            </Btn>
          </div>
        }>
        <FormField label="Título" required>
          <input style={inputStyle} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Nombre de la oportunidad" />
        </FormField>
        <FormField label="Cliente" required>
          <select style={selectStyle} value={form.clientId} onChange={e => setF('clientId', e.target.value)}>
            <option value="">Seleccionar cliente…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName ?? ''}{c.company ? ` — ${c.company}` : ''}</option>)}
          </select>
        </FormField>
        <FormRow>
          <FormField label="Etapa">
            <select style={selectStyle} value={form.stage} onChange={e => setF('stage', e.target.value)}>
              {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </FormField>
          <FormField label="Probabilidad (%)">
            <input style={inputStyle} type="number" min="0" max="100" value={form.probability} onChange={e => setF('probability', e.target.value)} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Valor estimado (€)">
            <input style={inputStyle} type="number" min="0" value={form.estimatedValue} onChange={e => setF('estimatedValue', e.target.value)} placeholder="0" />
          </FormField>
          <FormField label="Fecha de cierre esperada">
            <input style={inputStyle} type="date" value={form.expectedCloseDate} onChange={e => setF('expectedCloseDate', e.target.value)} />
          </FormField>
        </FormRow>
        <FormField label="Descripción">
          <textarea style={textareaStyle} value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Notas sobre la oportunidad…" />
        </FormField>
        <button ref={saveRef} type="button" style={{ display: 'none' }} onClick={handleSave} />
      </Modal>
    </div>
  )
}
