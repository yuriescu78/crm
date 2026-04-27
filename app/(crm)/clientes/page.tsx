'use client'
import { useState, useEffect } from 'react'
import { nexusDB } from '@/lib/db'
import { COLORS } from '@/lib/colors'
import { CLIENT_STATUSES, SECTORS, SOURCES } from '@/lib/constants'
import { formatDate, formatDateTime, initials, avatarColor, isOverdue } from '@/lib/utils'
import type { Client, Profile, Opportunity, Activity, Task, Document } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import { Btn, FormField, FormRow, inputStyle, selectStyle, textareaStyle, Spinner } from '@/components/ui/Forms'

/* ── Helpers ──────────────────────────────────────────────── */

function Avatar({ name, index, size = 32 }: { name: string; index: number; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarColor(index), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 700, color: 'white', flexShrink: 0 }}>
      {initials(name)}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const info = CLIENT_STATUSES[status] || { label: status, color: COLORS.n500, bg: COLORS.n100 }
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: info.bg, color: info.color }}>{info.label}</span>
}

function PriorityDot({ priority }: { priority: string }) {
  const c: Record<string, string> = { alta: COLORS.red, urgente: COLORS.red, media: COLORS.amber, baja: COLORS.n300 }
  return <div style={{ width: 7, height: 7, borderRadius: '50%', background: c[priority] || COLORS.n300, flexShrink: 0 }}/>
}

/* ── Client Form ─────────────────────────────────────────── */

function ClientForm({ client, profiles, onSave }: { client: Partial<Client> | null; profiles: Profile[]; onSave: (c: Partial<Client>) => void }) {
  const [form, setForm] = useState<Partial<Client>>({
    firstName: '', lastName: '', company: '', position: '',
    email: '', phone: '', city: '', sector: '', source: '',
    status: 'nuevo', priority: 'media', ownerId: profiles[0]?.id || '',
    summary: '', observations: '', tags: [],
    ...(client || {}),
  })
  const [tagInput, setTagInput] = useState('')
  const set = (k: keyof Client, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags?.includes(t)) set('tags', [...(form.tags || []), t])
    setTagInput('')
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Datos identificativos</div>
      <FormRow>
        <FormField label="Nombre" required><input style={inputStyle} value={form.firstName || ''} onChange={e => set('firstName', e.target.value)} placeholder="Nombre"/></FormField>
        <FormField label="Apellidos"><input style={inputStyle} value={form.lastName || ''} onChange={e => set('lastName', e.target.value)} placeholder="Apellidos"/></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Empresa"><input style={inputStyle} value={form.company || ''} onChange={e => set('company', e.target.value)} placeholder="Nombre de la empresa"/></FormField>
        <FormField label="Cargo"><input style={inputStyle} value={form.position || ''} onChange={e => set('position', e.target.value)} placeholder="Cargo o rol"/></FormField>
      </FormRow>
      <FormRow>
        <FormField label="Email"><input style={inputStyle} type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="email@empresa.com"/></FormField>
        <FormField label="Teléfono"><input style={inputStyle} value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="600 000 000"/></FormField>
      </FormRow>
      <FormField label="Ciudad"><input style={{ ...inputStyle, width: 'calc(50% - 7px)' }} value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="Madrid"/></FormField>

      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '8px 0 12px' }}>Datos comerciales</div>
      <FormRow>
        <FormField label="Estado" required>
          <select style={selectStyle} value={form.status} onChange={e => set('status', e.target.value as Client['status'])}>
            {Object.entries(CLIENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </FormField>
        <FormField label="Prioridad">
          <select style={selectStyle} value={form.priority} onChange={e => set('priority', e.target.value as Client['priority'])}>
            {['urgente', 'alta', 'media', 'baja'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="Sector">
          <select style={selectStyle} value={form.sector || ''} onChange={e => set('sector', e.target.value)}>
            <option value="">Seleccionar...</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Origen">
          <select style={selectStyle} value={form.source || ''} onChange={e => set('source', e.target.value)}>
            <option value="">Seleccionar...</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
      </FormRow>
      {profiles.length > 0 && (
        <FormField label="Responsable">
          <select style={{ ...selectStyle, width: 'calc(50% - 7px)' }} value={form.ownerId || ''} onChange={e => set('ownerId', e.target.value)}>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
          </select>
        </FormField>
      )}
      <FormField label="Observaciones">
        <textarea style={textareaStyle} value={form.observations || ''} onChange={e => set('observations', e.target.value)} placeholder="Notas internas, preferencias..."/>
      </FormField>
      <FormField label="Etiquetas">
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={tagInput} placeholder="Añadir etiqueta..."
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}/>
          <Btn variant="secondary" size="sm" onClick={addTag}>Añadir</Btn>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(form.tags || []).map(t => (
            <span key={t} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: COLORS.primary100, color: COLORS.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              {t}<span style={{ cursor: 'pointer' }} onClick={() => set('tags', (form.tags || []).filter(x => x !== t))}>×</span>
            </span>
          ))}
        </div>
      </FormField>
      <button style={{ display: 'none' }} data-save-client onClick={() => {
        if (!form.firstName) { alert('El nombre es obligatorio'); return }
        onSave(form)
      }}/>
    </div>
  )
}

/* ── Client Detail ───────────────────────────────────────── */

const ACT_ICONS: Record<string, string> = { llamada: '📞', email: '📧', nota: '📝', cambio: '🔄', reunion: '👥', tarea: '✅', documento: '📎', telegram: '✈️' }

function ClientDetail({ client, profiles, onClose, onEdit }: { client: Client; profiles: Profile[]; onClose: () => void; onEdit: (c: Client) => void }) {
  const [tab, setTab] = useState('resumen')
  const [opps, setOpps] = useState<Opportunity[]>([])
  const [acts, setActs] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const owner = profiles.find(p => p.id === client.ownerId)

  useEffect(() => {
    Promise.all([
      nexusDB.opportunities.list({ client_id: client.id }),
      nexusDB.activities.list({ client_id: client.id }),
      nexusDB.tasks.list({ client_id: client.id }),
      nexusDB.documents.list({ client_id: client.id }),
    ]).then(([o, a, t, d]) => { setOpps(o); setActs(a); setTasks(t); setDocs(d); setLoading(false) })
  }, [client.id])

  const TABS = ['resumen', 'actividad', 'oportunidades', 'tareas', 'documentos']

  return (
    <div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: COLORS.textSub, display: 'flex', alignItems: 'center', gap: 6, padding: '0 0 16px 0', fontFamily: 'inherit', fontWeight: 500 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Volver a clientes
      </button>

      <div style={{ background: 'white', borderRadius: 14, padding: '22px 24px', marginBottom: 18, boxShadow: '0 1px 3px oklch(0 0 0/0.06), 0 4px 16px oklch(0 0 0/0.05)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <Avatar name={`${client.firstName} ${client.lastName}`} index={client.id.charCodeAt(1)} size={56}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.02em' }}>{client.firstName} {client.lastName}</span>
              <StatusBadge status={client.status}/>
              <PriorityDot priority={client.priority}/>
            </div>
            <div style={{ fontSize: 13, color: COLORS.textSub, marginTop: 3 }}>{client.position}{client.company && ` · ${client.company}`}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              {client.email && <a href={`mailto:${client.email}`} style={{ fontSize: 12, color: COLORS.primary, textDecoration: 'none' }}>📧 {client.email}</a>}
              {client.phone && <span style={{ fontSize: 12, color: COLORS.textSub }}>📞 {client.phone}</span>}
              {client.city && <span style={{ fontSize: 12, color: COLORS.textSub }}>📍 {client.city}</span>}
            </div>
          </div>
          <Btn variant="secondary" size="sm" onClick={() => onEdit(client)}>Editar</Btn>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Sector', value: client.sector || '—' },
            { label: 'Origen', value: client.source || '—' },
            { label: 'Responsable', value: owner?.name || owner?.email || '—' },
            { label: 'Prioridad', value: client.priority },
            { label: 'Última actividad', value: formatDate(client.lastActivityAt) },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '6px 12px', borderRadius: 8, background: COLORS.n50, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{value}</div>
            </div>
          ))}
        </div>
        {client.tags && client.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {client.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: COLORS.primary100, color: COLORS.primary, fontWeight: 600 }}>{t}</span>)}
          </div>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 1px 3px oklch(0 0 0/0.06), 0 4px 16px oklch(0 0 0/0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}`, padding: '0 20px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 500, fontFamily: 'inherit', color: tab === t ? COLORS.primary : COLORS.textSub, borderBottom: tab === t ? `2px solid ${COLORS.primary}` : '2px solid transparent', marginBottom: -1, transition: 'all 0.12s', textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>
        <div style={{ padding: '20px 24px' }}>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner/></div> : (
            <>
              {tab === 'resumen' && (
                <div>
                  {client.summary && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Resumen</div><p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{client.summary}</p></div>}
                  {client.observations && <div><div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Observaciones</div><p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{client.observations}</p></div>}
                  {opps.length > 0 && <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Oportunidades ({opps.length})</div>
                    {opps.map(op => (
                      <div key={op.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: COLORS.n50, marginBottom: 6 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{op.title}</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>Cierre: {formatDate(op.expectedCloseDate)}</div></div>
                        <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{op.estimatedValue.toLocaleString()}€</div><span style={{ fontSize: 10, color: COLORS.textMuted }}>{op.probability}%</span></div>
                      </div>
                    ))}
                  </div>}
                </div>
              )}
              {tab === 'actividad' && (
                acts.length === 0 ? <div style={{ fontSize: 13, color: COLORS.textMuted }}>Sin actividad registrada</div> :
                <div>{acts.map((a, i) => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, paddingBottom: 16, position: 'relative' }}>
                    {i < acts.length - 1 && <div style={{ position: 'absolute', left: 14, top: 30, bottom: 0, width: 1, background: COLORS.border }}/>}
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS.n100, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, zIndex: 1 }}>{ACT_ICONS[a.type] || '●'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5, marginBottom: 4 }}>{a.description}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>{formatDateTime(a.createdAt)}</span>
                        <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, fontWeight: 700, background: a.origin === 'telegram' ? COLORS.primary100 : COLORS.n100, color: a.origin === 'telegram' ? COLORS.primary : COLORS.n500 }}>{a.origin}</span>
                      </div>
                    </div>
                  </div>
                ))}</div>
              )}
              {tab === 'oportunidades' && (
                opps.length === 0 ? <div style={{ fontSize: 13, color: COLORS.textMuted }}>Sin oportunidades</div> :
                <div>{opps.map(op => (
                  <div key={op.id} style={{ padding: '12px 16px', borderRadius: 10, background: COLORS.n50, border: `1px solid ${COLORS.border}`, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div><div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{op.title}</div><div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Creado {formatDate(op.createdAt)}</div></div>
                      <div style={{ textAlign: 'right' }}><div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{op.estimatedValue.toLocaleString()}€</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>{op.probability}% prob.</div></div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: COLORS.primary100, color: COLORS.primary, fontWeight: 600 }}>{op.stage}</span>
                      {op.expectedCloseDate && <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 8 }}>Cierre: {formatDate(op.expectedCloseDate)}</span>}
                    </div>
                  </div>
                ))}</div>
              )}
              {tab === 'tareas' && (
                tasks.length === 0 ? <div style={{ fontSize: 13, color: COLORS.textMuted }}>Sin tareas</div> :
                <div>{tasks.map(t => (
                  <div key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.borderSub}` }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: t.status === 'completada' ? COLORS.green600 : COLORS.n300 }}/>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 500, color: t.status === 'completada' ? COLORS.textMuted : COLORS.text, textDecoration: t.status === 'completada' ? 'line-through' : 'none' }}>{t.title}</div></div>
                    {t.dueDate && <span style={{ fontSize: 11, color: isOverdue(t.dueDate) && t.status !== 'completada' ? COLORS.red : COLORS.textMuted }}>{formatDate(t.dueDate)}</span>}
                  </div>
                ))}</div>
              )}
              {tab === 'documentos' && (
                docs.length === 0 ? <div style={{ fontSize: 13, color: COLORS.textMuted }}>Sin documentos</div> :
                <div>{docs.map(d => (
                  <div key={d.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: COLORS.n50, border: `1px solid ${COLORS.border}`, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{d.name}</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>{d.type} · {d.version} · {formatDate(d.createdAt)}</div></div>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: d.status === 'firmado' ? COLORS.green100 : d.status === 'enviado' ? COLORS.primary100 : COLORS.n100, color: d.status === 'firmado' ? COLORS.green600 : d.status === 'enviado' ? COLORS.primary : COLORS.n500, fontWeight: 600 }}>{d.status}</span>
                  </div>
                ))}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────── */

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterOwner, setFilterOwner] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([nexusDB.clients.list(), nexusDB.profiles.list()]).then(([c, p]) => {
      setClients(c); setProfiles(p); setLoading(false)
    })
  }, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return (!q || `${c.firstName} ${c.lastName} ${c.company} ${c.email} ${c.phone}`.toLowerCase().includes(q))
      && (!filterStatus || c.status === filterStatus)
      && (!filterOwner || c.ownerId === filterOwner)
  })

  const handleSave = async (data: Partial<Client>) => {
    setSaving(true)
    try {
      if (data.id) {
        const updated = await nexusDB.clients.update(data.id, data)
        if (updated) { setClients(p => p.map(c => c.id === updated.id ? updated : c)); if (selected?.id === updated.id) setSelected(updated) }
      } else {
        const created = await nexusDB.clients.create(data)
        if (created) setClients(p => [created, ...p])
      }
      setModalOpen(false)
    } finally { setSaving(false) }
  }

  if (selected) return <ClientDetail client={selected} profiles={profiles} onClose={() => setSelected(null)} onEdit={c => { setEditClient(c); setModalOpen(true) }}/>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.03em' }}>Clientes</div>
          <div style={{ fontSize: 13, color: COLORS.textSub, marginTop: 2 }}>{filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</div>
        </div>
        <Btn onClick={() => { setEditClient(null); setModalOpen(true) }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo cliente
        </Btn>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px oklch(0 0 0/0.06)' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, empresa, email..." style={{ ...inputStyle, paddingLeft: 32 }}/>
        </div>
        <select style={{ ...selectStyle, flex: '0 0 auto', minWidth: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(CLIENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {profiles.length > 0 && (
          <select style={{ ...selectStyle, flex: '0 0 auto', minWidth: 140 }} value={filterOwner} onChange={e => setFilterOwner(e.target.value)}>
            <option value="">Todos los responsables</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
          </select>
        )}
        {(search || filterStatus || filterOwner) && <Btn variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterOwner('') }}>Limpiar</Btn>}
      </div>

      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 1px 3px oklch(0 0 0/0.06), 0 4px 16px oklch(0 0 0/0.05)', overflow: 'hidden' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner/></div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {['Cliente', 'Empresa', 'Estado', 'Prioridad', 'Responsable', 'Última actividad', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', background: COLORS.n50 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>No se encontraron clientes</td></tr>
                : filtered.map((c, i) => {
                  const owner = profiles.find(p => p.id === c.ownerId)
                  return (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.borderSub}`, cursor: 'pointer' }} onClick={() => setSelected(c)} onMouseEnter={e => (e.currentTarget.style.background = COLORS.n50)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <Avatar name={`${c.firstName} ${c.lastName}`} index={i} size={32}/>
                          <div><div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{c.firstName} {c.lastName}</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>{c.email}</div></div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: COLORS.textSub }}>{c.company || '—'}</td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={c.status}/></td>
                      <td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PriorityDot priority={c.priority}/><span style={{ fontSize: 12, color: COLORS.textSub, textTransform: 'capitalize' }}>{c.priority}</span></div></td>
                      <td style={{ padding: '12px 16px' }}>
                        {owner && <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Avatar name={owner.name || owner.email || ''} index={profiles.indexOf(owner)} size={24}/><span style={{ fontSize: 12, color: COLORS.textSub }}>{owner.name || owner.email}</span></div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: COLORS.textMuted }}>{formatDate(c.lastActivityAt)}</td>
                      <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Btn variant="secondary" size="sm" onClick={() => setSelected(c)}>Ver</Btn>
                          <Btn variant="secondary" size="sm" onClick={() => { setEditClient(c); setModalOpen(true) }}>Editar</Btn>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editClient ? `Editar: ${editClient.firstName} ${editClient.lastName}` : 'Nuevo cliente'} width={600}
        footer={<><Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Btn><Btn disabled={saving} onClick={() => document.querySelector<HTMLButtonElement>('[data-save-client]')?.click()}>{saving ? 'Guardando...' : editClient ? 'Guardar cambios' : 'Crear cliente'}</Btn></>}
      >
        <ClientForm client={editClient} profiles={profiles} onSave={handleSave}/>
      </Modal>
    </div>
  )
}
